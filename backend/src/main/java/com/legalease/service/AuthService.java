package com.legalease.service;

import com.legalease.dto.request.*;
import com.legalease.dto.response.AuthResponse;
import com.legalease.entity.*;
import com.legalease.exception.*;
import com.legalease.repository.*;
import com.legalease.security.JwtUtil;
import com.legalease.util.AesEncryptionUtil;
import com.legalease.util.DeviceFingerprintUtil;
import com.legalease.util.IdValidationUtil;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.code.HashingAlgorithm;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final DeviceSessionRepository deviceSessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final EmailService emailService;
    private final RateLimitService rateLimitService;
    private final ThreatDetectionService threatDetectionService;
    private final DeviceFingerprintUtil deviceFingerprintUtil;

    @Value("${app.admin-ip-whitelist:127.0.0.1,0:0:0:0:0:0:0:1}")
    private String adminIpWhitelist;

    public AuthService(UserRepository userRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       LoginAttemptRepository loginAttemptRepository,
                       DeviceSessionRepository deviceSessionRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       OtpService otpService,
                       EmailService emailService,
                       RateLimitService rateLimitService,
                       ThreatDetectionService threatDetectionService,
                       DeviceFingerprintUtil deviceFingerprintUtil) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.deviceSessionRepository = deviceSessionRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpService = otpService;
        this.emailService = emailService;
        this.rateLimitService = rateLimitService;
        this.threatDetectionService = threatDetectionService;
        this.deviceFingerprintUtil = deviceFingerprintUtil;
    }

    @Transactional
    public String register(RegisterRequest req, HttpServletRequest request) {
        String clientIp = deviceFingerprintUtil.getClientIp(request);

        // 1. Rate Limit: 3 / IP / hour (generous limit for localhost during testing)
        boolean isLocalhost = "127.0.0.1".equals(clientIp) || "0:0:0:0:0:0:0:1".equals(clientIp) || "localhost".equalsIgnoreCase(clientIp);
        int maxReg = isLocalhost ? 1000 : 3;
        rateLimitService.checkRateLimit("register", clientIp, maxReg, 3600);

        // 2. Threat check: 3+ accounts from same IP in 1 hour (skip for localhost)
        if (!isLocalhost) {
            long recentRegistrations = userRepository.countByIpAndCreatedAtAfter(clientIp, LocalDateTime.now().minusHours(1));
            if (recentRegistrations >= 3) {
                threatDetectionService.recordMultipleAccounts(clientIp);
                throw new RateLimitException("Registration temporarily restricted from this IP. Please try again later.");
            }
        }

        // 3. Check email uniqueness
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new DuplicateIdException("Email is already registered. Please sign in or use another email.");
        }

        User.Role role = User.Role.CLIENT;
        if ("LAWYER".equalsIgnoreCase(req.getRole())) {
            role = User.Role.LAWYER;
        }

        String rawPassword = (req.getPassword() != null && !req.getPassword().isBlank())
                ? req.getPassword()
                : java.util.UUID.randomUUID().toString();

        User user = new User(
                req.getFullName().trim(),
                req.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(rawPassword),
                role
        );
        user.setLastLoginIp(clientIp);
        user.setAccountStatus(User.AccountStatus.PENDING_VERIFICATION);
        User savedUser = userRepository.save(user);

        // Send Email OTP and return raw OTP for reliable delivery
        String otp = otpService.sendEmailOtp(savedUser, EmailVerification.OtpPurpose.REGISTRATION);
        log.info("New registration: {} (Role: {}) from IP: {}", savedUser.getEmail(), role, clientIp);
        return otp;
    }

    @Transactional
    public AuthResponse verifyEmail(VerifyOtpRequest req, HttpServletRequest request) {
        String email = req.getEmail().trim().toLowerCase();
        otpService.verifyEmailOtp(email, req.getOtp().trim(), EmailVerification.OtpPurpose.REGISTRATION);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        user.setIsEmailVerified(true);
        if (user.getAccountStatus() == User.AccountStatus.PENDING_VERIFICATION) {
            user.setAccountStatus(User.AccountStatus.PENDING_KYC);
        }
        userRepository.save(user);

        String clientIp = deviceFingerprintUtil.getClientIp(request);
        handleDeviceSession(user, request, null, clientIp);

        return buildAuthResponse(user, request, req.getPhoneNumber());
    }

    @Transactional
    public void sendPhoneOtp(User user, String phoneNumber) {
        user.setPhoneNumber(phoneNumber.trim());
        userRepository.save(user);
        otpService.sendPhoneOtp(user, phoneNumber.trim());
    }

    @Transactional
    public void verifyPhone(User user, String otp) {
        boolean valid = otpService.verifyPhoneOtp(user, otp.trim());
        if (!valid) {
            throw new UnauthorizedException("Invalid or expired phone verification code.");
        }
        user.setIsPhoneVerified(true);
        userRepository.save(user);
    }

    @Transactional(noRollbackFor = {UnauthorizedException.class, AccountDisabledException.class, AccountLockedException.class, AccountSuspendedException.class})
    public AuthResponse login(LoginRequest req, HttpServletRequest request) {
        String clientIp = deviceFingerprintUtil.getClientIp(request);
        String email = req.getEmail().trim().toLowerCase();

        // 1. Sliding Window Rate limit: 30 / IP / 10 min
        rateLimitService.checkRateLimit("login", clientIp, 30, 600);

        // 2. Fetch User
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            recordLoginAttempt(email, clientIp, false, "User not found", req.getDeviceFingerprint());
            throw new UnauthorizedException("Invalid email or password");
        }

        User user = userOpt.get();

        // 3. Status & Temporary Lockout checks
        if (user.getLockedUntil() != null) {
            if (user.getLockedUntil().isAfter(LocalDateTime.now())) {
                long remainingMinutes = java.time.Duration.between(LocalDateTime.now(), user.getLockedUntil()).toMinutes() + 1;
                throw new AccountDisabledException("Account is temporarily blocked due to repeated failed login attempts. Please try again in " + remainingMinutes + " minute(s), or reset your password.");
            } else {
                // Lockout window expired: automatically restore
                user.setLockedUntil(null);
                user.setFailedLoginCount(0);
                if (user.getAccountStatus() == User.AccountStatus.TEMPORARILY_DISABLED) {
                    user.setAccountStatus(User.AccountStatus.ACTIVE);
                    user.setDisableReason(null);
                }
                userRepository.save(user);
            }
        }

        if (user.getAccountStatus() == User.AccountStatus.LOCKED) {
            throw new AccountLockedException("Account locked due to excessive failed attempts. Please contact legalease.systemsupport@gmail.com.");
        }
        if (user.getAccountStatus() == User.AccountStatus.SUSPENDED) {
            throw new AccountSuspendedException("Account suspended: " + (user.getDisableReason() != null ? user.getDisableReason() : "Security violation"));
        }
        if (user.getAccountStatus() == User.AccountStatus.DISABLED ||
            user.getAccountStatus() == User.AccountStatus.TEMPORARILY_DISABLED ||
            user.getAccountStatus() == User.AccountStatus.AGE_VERIFICATION_REQUIRED) {
            throw new AccountDisabledException("Account paused: " + (user.getDisableReason() != null ? user.getDisableReason() : "Verification required"));
        }

        // 4. Password validation
        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            user.setFailedLoginCount(user.getFailedLoginCount() + 1);

            recordLoginAttempt(email, clientIp, false, "Invalid password", req.getDeviceFingerprint());

            // Threat detection check
            long failedIp = loginAttemptRepository.countFailedByIpSince(clientIp, LocalDateTime.now().minusMinutes(10));
            long failedAccount = loginAttemptRepository.countFailedByEmailSince(email, LocalDateTime.now().minusHours(1));
            threatDetectionService.recordBruteForceAttempt(clientIp, email, failedIp, failedAccount);

            if (user.getFailedLoginCount() >= 5) {
                user.setAccountStatus(User.AccountStatus.TEMPORARILY_DISABLED);
                user.setLockedUntil(LocalDateTime.now().plusMinutes(15));
                user.setDisableReason("5 consecutive incorrect password entries - temporary 15-minute security block");
                userRepository.save(user);

                // Invalidate all active sessions for security
                try {
                    refreshTokenRepository.revokeAllByUserId(user.getId());
                } catch (Exception ignored) {}

                // Send security notification email
                emailService.sendAccountDisabledEmail(user.getEmail(), user.getFullName(),
                        "Your account has been temporarily blocked for 15 minutes due to 5 consecutive failed login attempts.", "lockout-" + user.getId());

                throw new AccountDisabledException("Account has been temporarily blocked for 15 minutes due to 5 consecutive incorrect passwords. Active sessions have expired. You may also reset your password immediately.");
            }

            userRepository.save(user);
            int remaining = 5 - user.getFailedLoginCount();
            throw new UnauthorizedException("Invalid email or password. " + remaining + " attempt(s) remaining before temporary account block.");
        }

        // 5. Success reset & device tracking
        user.setFailedLoginCount(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        user.setLastLoginIp(clientIp);
        user.setLoginCount(user.getLoginCount() + 1);
        userRepository.save(user);

        recordLoginAttempt(email, clientIp, true, "Success", req.getDeviceFingerprint());

        handleDeviceSession(user, request, req.getDeviceFingerprint(), clientIp);

        return buildAuthResponse(user, request, null);
    }

    @Transactional
    public AuthResponse adminLogin(AdminLoginRequest req, HttpServletRequest request) {
        String clientIp = deviceFingerprintUtil.getClientIp(request);
        String email = req.getEmail().trim().toLowerCase();

        // 1. Admin IP Whitelist Check
        List<String> allowedIps = Arrays.asList(adminIpWhitelist.split(","));
        boolean ipWhitelisted = allowedIps.stream().anyMatch(ip -> ip.trim().equals(clientIp) || "127.0.0.1".equals(ip.trim()) || "0:0:0:0:0:0:0:1".equals(ip.trim()));
        if (!ipWhitelisted) {
            log.warn("Unauthorized Admin login attempt from non-whitelisted IP: {}", clientIp);
            throw new UnauthorizedException("Access denied: Admin login restricted to whitelisted networks");
        }

        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid administrator credentials"));

        if (admin.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Access denied: Insufficient privileges");
        }

        if (!passwordEncoder.matches(req.getPassword(), admin.getPasswordHash())) {
            throw new UnauthorizedException("Invalid administrator credentials");
        }

        // 2. TOTP 2FA Verification (dev.samstevens.totp)
        if (Boolean.TRUE.equals(admin.getIsTotpEnabled()) && admin.getTotpSecret() != null) {
            if (req.getTotpCode() == null || req.getTotpCode().isBlank()) {
                AuthResponse resp = new AuthResponse();
                resp.setRequires2FA(true);
                resp.setEmail(admin.getEmail());
                resp.setRole("ADMIN");
                return resp;
            }

            TimeProvider timeProvider = new SystemTimeProvider();
            CodeVerifier verifier = new DefaultCodeVerifier(new dev.samstevens.totp.code.DefaultCodeGenerator(HashingAlgorithm.SHA1), timeProvider);
            if (!verifier.isValidCode(admin.getTotpSecret(), req.getTotpCode().trim())) {
                throw new UnauthorizedException("Invalid 2FA authentication code");
            }
        }

        admin.setLastLoginAt(LocalDateTime.now());
        admin.setLastLoginIp(clientIp);
        userRepository.save(admin);

        return buildAuthResponse(admin, request, null);
    }

    @Transactional
    public AuthResponse refreshToken(String rawRefreshToken, HttpServletRequest request) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new UnauthorizedException("Missing refresh token");
        }

        String tokenHash = AesEncryptionUtil.sha256Hex(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid or unrecognized refresh token"));

        if (Boolean.TRUE.equals(token.getIsRevoked()) || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token is expired or revoked. Please sign in again.");
        }

        User user = token.getUser();
        token.setLastUsedAt(LocalDateTime.now());
        refreshTokenRepository.save(token);

        String newAccessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(), user.getAccountStatus().name());

        return new AuthResponse(
                newAccessToken,
                rawRefreshToken,
                user.getRole() == User.Role.ADMIN ? jwtUtil.getAdminExpiration() : jwtUtil.getAccessExpiration(),
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                false,
                IdValidationUtil.maskPhoneNumber(user.getPhoneNumber())
        );
    }

    @Transactional
    public void logout(Long userId, String rawRefreshToken) {
        if (rawRefreshToken != null) {
            String tokenHash = AesEncryptionUtil.sha256Hex(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(t -> {
                t.setIsRevoked(true);
                refreshTokenRepository.save(t);
            });
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with this email address"));
        otpService.sendEmailOtp(user, EmailVerification.OtpPurpose.PASSWORD_RESET);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        otpService.verifyEmailOtp(email, req.getOtp().trim(), EmailVerification.OtpPurpose.PASSWORD_RESET);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        user.setFailedLoginCount(0);
        if (user.getAccountStatus() == User.AccountStatus.LOCKED || user.getAccountStatus() == User.AccountStatus.TEMPORARILY_DISABLED) {
            user.setAccountStatus(User.AccountStatus.ACTIVE);
            user.setDisableReason(null);
        }
        userRepository.save(user);

        // Revoke all existing sessions for security
        refreshTokenRepository.revokeAllByUserId(user.getId());
    }

    @Transactional
    public String resendOtp(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        rateLimitService.checkRateLimit("otp", String.valueOf(user.getId()), 10, 3600);
        return otpService.sendEmailOtp(user, EmailVerification.OtpPurpose.REGISTRATION);
    }

    @Transactional
    public String sendLoginOtp(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with this email address"));
        return otpService.sendEmailOtp(user, EmailVerification.OtpPurpose.REGISTRATION);
    }

    @Transactional
    public AuthResponse verifyLoginOtp(String email, String otp, HttpServletRequest request) {
        otpService.verifyEmailOtp(email.trim().toLowerCase(), otp.trim(), EmailVerification.OtpPurpose.REGISTRATION);
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsEmailVerified(true);
        if (user.getAccountStatus() == User.AccountStatus.PENDING_VERIFICATION) {
            user.setAccountStatus(Boolean.TRUE.equals(user.getIsIdVerified()) ? User.AccountStatus.ACTIVE : User.AccountStatus.PENDING_KYC);
        }
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginCount(0);
        userRepository.save(user);

        String clientIp = deviceFingerprintUtil.getClientIp(request);
        handleDeviceSession(user, request, null, clientIp);

        return buildAuthResponse(user, request, null);
    }

    private AuthResponse buildAuthResponse(User user, HttpServletRequest request, String optionalPhone) {
        String accessToken = jwtUtil.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().name(), user.getAccountStatus().name());

        String rawRefreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());
        String tokenHash = AesEncryptionUtil.sha256Hex(rawRefreshToken);

        String clientIp = deviceFingerprintUtil.getClientIp(request);
        String userAgent = deviceFingerprintUtil.getUserAgent(request);
        String fingerprint = deviceFingerprintUtil.resolveDeviceFingerprint(request, null);

        RefreshToken tokenEntity = new RefreshToken(
                user, tokenHash, fingerprint, clientIp, userAgent,
                LocalDateTime.now().plusDays(7)
        );
        refreshTokenRepository.save(tokenEntity);

        long expiry = user.getRole() == User.Role.ADMIN ? jwtUtil.getAdminExpiration() : jwtUtil.getAccessExpiration();

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                expiry,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getAccountStatus().name(),
                false,
                IdValidationUtil.maskPhoneNumber(user.getPhoneNumber())
        );
    }

    private void handleDeviceSession(User user, HttpServletRequest request, String clientFingerprint, String clientIp) {
        String fingerprint = deviceFingerprintUtil.resolveDeviceFingerprint(request, clientFingerprint);
        String userAgent = deviceFingerprintUtil.getUserAgent(request);

        boolean exists = deviceSessionRepository.existsByUserIdAndDeviceFingerprint(user.getId(), fingerprint);
        if (!exists) {
            // New device login
            DeviceSession session = new DeviceSession(user, fingerprint, clientIp, userAgent, "Unknown", "Unknown", false);
            deviceSessionRepository.save(session);
            emailService.sendNewDeviceAlert(user.getEmail(), user.getFullName(), clientIp, userAgent);
        } else {
            deviceSessionRepository.findByUserIdAndDeviceFingerprint(user.getId(), fingerprint).ifPresent(s -> {
                s.setLastSeen(LocalDateTime.now());
                s.setIpAddress(clientIp);
                deviceSessionRepository.save(s);
            });
        }
    }

    private void recordLoginAttempt(String email, String ip, boolean success, String reason, String fingerprint) {
        LoginAttempt attempt = new LoginAttempt(email, ip, success, reason, fingerprint);
        loginAttemptRepository.save(attempt);
    }

    @Transactional
    public java.util.Map<String, String> getTwoFactorSetup(User user) {
        dev.samstevens.totp.secret.SecretGenerator generator = new dev.samstevens.totp.secret.DefaultSecretGenerator();
        String secret = generator.generate();

        dev.samstevens.totp.qr.QrData data = new dev.samstevens.totp.qr.QrData.Builder()
                .label(user.getEmail())
                .secret(secret)
                .issuer("LegalEase")
                .algorithm(HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();

        String qrCodeUri = "";
        try {
            dev.samstevens.totp.qr.QrGenerator qrGenerator = new dev.samstevens.totp.qr.ZxingPngQrGenerator();
            byte[] imageData = qrGenerator.generate(data);
            qrCodeUri = dev.samstevens.totp.util.Utils.getDataUriForImage(imageData, qrGenerator.getImageMimeType());
        } catch (Exception e) {
            log.warn("Failed to generate QR image: " + e.getMessage());
            qrCodeUri = data.getUri();
        }

        user.setTotpSecret(secret);
        userRepository.save(user);

        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("secretKey", secret);
        response.put("secret", secret);
        response.put("qrCodeUri", qrCodeUri);
        return response;
    }

    @Transactional
    public void enableTwoFactor(User user, String code) {
        if (user.getTotpSecret() == null) {
            throw new IllegalArgumentException("2FA setup not initialized. Please request a new QR code.");
        }

        TimeProvider timeProvider = new SystemTimeProvider();
        CodeVerifier verifier = new DefaultCodeVerifier(new dev.samstevens.totp.code.DefaultCodeGenerator(HashingAlgorithm.SHA1), timeProvider);
        if (!verifier.isValidCode(user.getTotpSecret(), code.trim())) {
            throw new UnauthorizedException("Invalid 2FA verification code. Please check your authenticator app.");
        }

        user.setIsTotpEnabled(true);
        userRepository.save(user);
    }
}

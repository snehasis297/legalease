package com.legalease.controller;

import com.legalease.dto.request.*;
import com.legalease.dto.response.ApiResponse;
import com.legalease.dto.response.AuthResponse;
import com.legalease.entity.User;
import com.legalease.repository.UserRepository;
import com.legalease.service.AuthService;
import com.legalease.service.VerificationService;
import com.legalease.util.DeviceFingerprintUtil;
import com.legalease.exception.UnauthorizedException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final VerificationService verificationService;
    private final UserRepository userRepository;
    private final DeviceFingerprintUtil deviceFingerprintUtil;

    public AuthController(AuthService authService,
                          VerificationService verificationService,
                          UserRepository userRepository,
                          DeviceFingerprintUtil deviceFingerprintUtil) {
        this.authService = authService;
        this.verificationService = verificationService;
        this.userRepository = userRepository;
        this.deviceFingerprintUtil = deviceFingerprintUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request,
                                                                                HttpServletRequest servletRequest) {
        authService.register(request, servletRequest);
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("email", request.getEmail());
        data.put("role", request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Verification code dispatched to your email inbox.", data));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmail(@Valid @RequestBody VerifyOtpRequest request,
                                                                 HttpServletRequest servletRequest) {
        AuthResponse response = authService.verifyEmail(request, servletRequest);
        return ResponseEntity.ok(ApiResponse.ok("Email successfully verified.", response));
    }

    @PostMapping("/verify-phone")
    public ResponseEntity<ApiResponse<Void>> verifyPhone(@RequestBody VerifyOtpRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        authService.verifyPhone(user, request.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Phone number verified successfully."));
    }

    @PostMapping("/send-phone-otp")
    public ResponseEntity<ApiResponse<Void>> sendPhoneOtp(@RequestBody VerifyOtpRequest request,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        authService.sendPhoneOtp(user, request.getPhoneNumber());
        return ResponseEntity.ok(ApiResponse.ok("Phone verification code sent."));
    }

    @PostMapping("/submit-kyc")
    public ResponseEntity<ApiResponse<Void>> submitKyc(@Valid @RequestBody KycRequest request,
                                                       @AuthenticationPrincipal UserDetails userDetails,
                                                       HttpServletRequest servletRequest) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String clientIp = deviceFingerprintUtil.getClientIp(servletRequest);

        verificationService.submitKyc(
                user,
                request.getDateOfBirth(),
                request.getGender(),
                request.getAddress(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                User.GovernmentIdType.valueOf(request.getGovernmentIdType().toUpperCase()),
                request.getGovernmentIdNumber(),
                clientIp
        );

        return ResponseEntity.ok(ApiResponse.ok("Government ID KYC submitted and verified successfully."));
    }

    @PostMapping(value = "/verify-identity", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> verifyIdentity(
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("gender") String gender,
            @RequestParam("address") String address,
            @RequestParam("city") String city,
            @RequestParam("state") String state,
            @RequestParam("pincode") String pincode,
            @RequestParam("governmentIdType") String governmentIdType,
            @RequestParam("governmentIdNumber") String governmentIdNumber,
            @RequestParam(value = "govtIdFront", required = false) org.springframework.web.multipart.MultipartFile govtIdFront,
            @RequestParam(value = "govtIdBack", required = false) org.springframework.web.multipart.MultipartFile govtIdBack,
            @RequestParam(value = "selfieImage", required = false) org.springframework.web.multipart.MultipartFile selfieImage,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest servletRequest) {

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String clientIp = deviceFingerprintUtil.getClientIp(servletRequest);

        java.util.Map<String, Object> result = verificationService.verifyIdentity(
                user,
                dateOfBirth,
                gender,
                address,
                city,
                state,
                pincode,
                User.GovernmentIdType.valueOf(governmentIdType.toUpperCase()),
                governmentIdNumber,
                govtIdFront,
                govtIdBack,
                selfieImage,
                clientIp
        );

        return ResponseEntity.ok(ApiResponse.ok("Identity and biometric verification completed successfully.", result));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest servletRequest) {
        AuthResponse response = authService.login(request, servletRequest);
        return ResponseEntity.ok(ApiResponse.ok("Login successful.", response));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(@Valid @RequestBody AdminLoginRequest request,
                                                                HttpServletRequest servletRequest) {
        AuthResponse response = authService.adminLogin(request, servletRequest);
        return ResponseEntity.ok(ApiResponse.ok("Admin login successful.", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestHeader(value = "X-Refresh-Token", required = false) String refreshTokenHeader,
                                                             @RequestBody(required = false) LoginRequest optionalBody,
                                                             HttpServletRequest servletRequest) {
        String token = refreshTokenHeader;
        if ((token == null || token.isBlank()) && optionalBody != null) {
            token = optionalBody.getPassword(); // fallback if sent in body
        }
        AuthResponse response = authService.refreshToken(token, servletRequest);
        return ResponseEntity.ok(ApiResponse.ok("Token refreshed successfully.", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader(value = "X-Refresh-Token", required = false) String refreshToken,
                                                    @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails != null) {
            userRepository.findByEmail(userDetails.getUsername())
                    .ifPresent(u -> authService.logout(u.getId(), refreshToken));
        }
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully."));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset code dispatched to email if account exists."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully. Please sign in with your new password."));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> resendOtp(@RequestBody ForgotPasswordRequest request) {
        authService.resendOtp(request.getEmail());
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("email", request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Verification code dispatched to " + request.getEmail(), data));
    }

    @PostMapping("/login-otp")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> sendLoginOtp(@RequestBody ForgotPasswordRequest request) {
        authService.sendLoginOtp(request.getEmail());
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("email", request.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Sign-in code dispatched to your email inbox.", data));
    }

    @PostMapping("/verify-login-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyLoginOtp(@RequestBody VerifyOtpRequest request,
                                                                    HttpServletRequest servletRequest) {
        AuthResponse response = authService.verifyLoginOtp(request.getEmail(), request.getOtp(), servletRequest);
        return ResponseEntity.ok(ApiResponse.ok("Sign in successful.", response));
    }

    @GetMapping("/2fa/setup")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getTwoFactorSetup(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Please sign in first");
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(ApiResponse.ok("2FA setup initialized", authService.getTwoFactorSetup(user)));
    }

    @PostMapping("/2fa/enable")
    public ResponseEntity<ApiResponse<Void>> enableTwoFactor(@RequestBody java.util.Map<String, String> body,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new UnauthorizedException("Please sign in first");
        }
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        authService.enableTwoFactor(user, body.get("code"));
        return ResponseEntity.ok(ApiResponse.ok("Two-factor authentication successfully enabled."));
    }
}

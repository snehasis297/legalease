package com.legalease.service;

import com.legalease.entity.IpBlacklist;
import com.legalease.entity.SuspiciousActivity;
import com.legalease.entity.User;
import com.legalease.exception.DuplicateIdException;
import com.legalease.exception.FileProcessingException;
import com.legalease.repository.IpBlacklistRepository;
import com.legalease.repository.SuspiciousActivityRepository;
import com.legalease.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class ThreatDetectionService {

    private static final Logger log = LoggerFactory.getLogger(ThreatDetectionService.class);

    private final SuspiciousActivityRepository suspiciousActivityRepository;
    private final IpBlacklistRepository ipBlacklistRepository;
    private final UserRepository userRepository;
    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    public ThreatDetectionService(SuspiciousActivityRepository suspiciousActivityRepository,
                                  IpBlacklistRepository ipBlacklistRepository,
                                  UserRepository userRepository,
                                  @org.springframework.beans.factory.annotation.Autowired(required = false) StringRedisTemplate redisTemplate,
                                  EmailService emailService) {
        this.suspiciousActivityRepository = suspiciousActivityRepository;
        this.ipBlacklistRepository = ipBlacklistRepository;
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
        this.emailService = emailService;
    }

    // 1. FAKE_ID_ATTEMPT
    @Transactional
    public void recordFakeIdAttempt(User user, String ipAddress, String details) {
        SuspiciousActivity sa = new SuspiciousActivity(
                user, ipAddress, SuspiciousActivity.ActivityType.FAKE_ID_ATTEMPT, details, SuspiciousActivity.Severity.MEDIUM);
        suspiciousActivityRepository.save(sa);

        long recentCount = suspiciousActivityRepository.countByIpAndTypeSince(
                ipAddress, SuspiciousActivity.ActivityType.FAKE_ID_ATTEMPT, LocalDateTime.now().minusHours(1));

        if (recentCount >= 3) {
            blockIp(ipAddress, "3 fake ID format attempts detected within 1 hour", 60, false);
        }
    }

    // 2. DUPLICATE_ID
    @Transactional
    public void handleDuplicateIdAttempt(User user, String ipAddress, String idHash) {
        if (user != null) {
            user.setAccountStatus(User.AccountStatus.SUSPENDED);
            user.setDisableReason("Security Violation: Duplicate Government ID submitted");
            userRepository.save(user);
        }

        SuspiciousActivity sa = new SuspiciousActivity(
                user, ipAddress, SuspiciousActivity.ActivityType.DUPLICATE_ID,
                "Duplicate ID hash attempt: " + idHash + ". Account suspended.", SuspiciousActivity.Severity.HIGH);
        suspiciousActivityRepository.save(sa);

        // Alert Admin
        log.warn("SECURITY ALERT: Duplicate ID detected for user {} from IP {}",
                user != null ? user.getEmail() : "Anonymous", ipAddress);

        throw new DuplicateIdException("This Government ID is already registered to another account. Your account has been suspended for security review.");
    }

    // 3. BRUTE_FORCE
    @Transactional
    public void recordBruteForceAttempt(String ipAddress, String email, long failedCountIp, long failedCountAccount) {
        if (failedCountIp >= 5) {
            blockIp(ipAddress, "5 failed login attempts from IP in 10 minutes", 10, false);
            SuspiciousActivity sa = new SuspiciousActivity(
                    null, ipAddress, SuspiciousActivity.ActivityType.BRUTE_FORCE,
                    "Brute force detected from IP: " + ipAddress + " on email: " + email, SuspiciousActivity.Severity.HIGH);
            suspiciousActivityRepository.save(sa);
        }

        if (failedCountAccount >= 10 && email != null) {
            userRepository.findByEmail(email).ifPresent(user -> {
                user.setAccountStatus(User.AccountStatus.LOCKED);
                user.setDisableReason("Account locked: 10 failed login attempts in 1 hour");
                userRepository.save(user);
                log.warn("Account locked due to brute force: {}", email);
            });
        }
    }

    // 4. BOT_DETECTED (10+ requests in 1 second)
    @Transactional
    public void recordBotDetected(String ipAddress, String details) {
        long botCount = suspiciousActivityRepository.countByIpAndTypeSince(
                ipAddress, SuspiciousActivity.ActivityType.BOT_DETECTED, LocalDateTime.now().minusDays(7));

        boolean permanent = (botCount >= 2); // 3rd time is permanent
        int blockMinutes = permanent ? 0 : 60;
        blockIp(ipAddress, "Bot / Scraping activity detected: " + details, blockMinutes, permanent);

        SuspiciousActivity sa = new SuspiciousActivity(
                null, ipAddress, SuspiciousActivity.ActivityType.BOT_DETECTED,
                details + (permanent ? " [PERMANENT BLACKLIST]" : ""), SuspiciousActivity.Severity.CRITICAL);
        suspiciousActivityRepository.save(sa);
    }

    // 5. MALICIOUS_FILE
    @Transactional
    public void recordMaliciousFile(User user, String ipAddress, String filename, String details) {
        SuspiciousActivity sa = new SuspiciousActivity(
                user, ipAddress, SuspiciousActivity.ActivityType.MALICIOUS_FILE,
                "Malicious file upload attempted: " + filename + " - " + details, SuspiciousActivity.Severity.HIGH);
        suspiciousActivityRepository.save(sa);

        throw new FileProcessingException("Security check failed: File header magic bytes do not match expected format.");
    }

    // 6. MULTIPLE_ACCOUNTS (Same IP registers 3+ accounts in 1 hour)
    @Transactional
    public void recordMultipleAccounts(String ipAddress) {
        blockIp(ipAddress, "Multiple account registration abuse: 3+ accounts in 1 hour", 1440, false);
        SuspiciousActivity sa = new SuspiciousActivity(
                null, ipAddress, SuspiciousActivity.ActivityType.MULTIPLE_ACCOUNTS,
                "IP registered 3+ accounts within 1 hour. IP blocked for 24 hours.", SuspiciousActivity.Severity.HIGH);
        suspiciousActivityRepository.save(sa);
    }

    // IP BLOCK HELPER
    @Transactional
    public void blockIp(String ipAddress, String reason, int durationMinutes, boolean permanent) {
        LocalDateTime blockedUntil = permanent ? null : LocalDateTime.now().plusMinutes(durationMinutes);
        IpBlacklist entry = ipBlacklistRepository.findByIpAddress(ipAddress).orElse(new IpBlacklist());
        entry.setIpAddress(ipAddress);
        entry.setReason(reason);
        entry.setBlockedUntil(blockedUntil);
        entry.setIsPermanent(permanent);
        ipBlacklistRepository.save(entry);

        // Update Redis blacklist cache
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForSet().add("blacklisted_ips", ipAddress);
                if (!permanent) {
                    redisTemplate.expire("blacklisted_ips", Duration.ofMinutes(durationMinutes));
                }
            }
        } catch (Exception ignored) {
        }

        log.warn("[THREAT DETECTION] IP {} has been blocked. Reason: {} (Permanent: {})", ipAddress, reason, permanent);
    }
}

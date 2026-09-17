package com.legalease.service;

import com.legalease.entity.AccountAppeal;
import com.legalease.entity.User;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import com.legalease.repository.AccountAppealRepository;
import com.legalease.repository.RefreshTokenRepository;
import com.legalease.repository.UserRepository;
import com.legalease.util.AesEncryptionUtil;
import com.legalease.util.AuditLogUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class AccountSafetyService {

    private static final Logger log = LoggerFactory.getLogger(AccountSafetyService.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AccountAppealRepository accountAppealRepository;
    private final EmailService emailService;
    private final StringRedisTemplate redisTemplate;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final AuditLogUtil auditLogUtil;

    @Value("${appeal.docs-dir:appeal-docs/}")
    private String appealDocsDir;

    @Value("${app.appeal-token-expiry-days:30}")
    private int appealTokenExpiryDays;

    public AccountSafetyService(UserRepository userRepository,
                                RefreshTokenRepository refreshTokenRepository,
                                AccountAppealRepository accountAppealRepository,
                                EmailService emailService,
                                @org.springframework.beans.factory.annotation.Autowired(required = false) StringRedisTemplate redisTemplate,
                                AesEncryptionUtil aesEncryptionUtil,
                                AuditLogUtil auditLogUtil) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.accountAppealRepository = accountAppealRepository;
        this.emailService = emailService;
        this.redisTemplate = redisTemplate;
        this.aesEncryptionUtil = aesEncryptionUtil;
        this.auditLogUtil = auditLogUtil;
    }

    @Transactional
    public void disableAccount(User user, User.AccountStatus targetStatus, String reason, AccountAppeal.AppealType appealType) {
        // 1. Update account status in DB
        user.setAccountStatus(targetStatus);
        user.setDisableReason(reason);
        userRepository.save(user);

        // 2. Blacklist all active tokens in Redis
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForSet().add("blacklisted_users", String.valueOf(user.getId()));
            }
        } catch (Exception ignored) {
        }

        // 3. Forced logout: Revoke all refresh tokens
        refreshTokenRepository.revokeAllByUserId(user.getId());

        // 4. Generate unique UUID appeal token (30-day expiry)
        String appealToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusDays(appealTokenExpiryDays);

        // 5. Save to account_appeals table
        AccountAppeal appeal = new AccountAppeal(user, appealType, reason, appealToken, expiresAt);
        accountAppealRepository.save(appeal);

        // 6. Send appropriate disable email
        if (targetStatus == User.AccountStatus.AGE_VERIFICATION_REQUIRED) {
            emailService.sendAgeVerificationEmail(user.getEmail(), user.getFullName(), appealToken);
        } else {
            emailService.sendAccountDisabledEmail(user.getEmail(), user.getFullName(), reason, appealToken);
        }

        // 7. Log audit
        auditLogUtil.log(user, "ACCOUNT_DISABLED", "USER", user.getId(), null, 403,
                "Status: " + targetStatus + " | Reason: " + reason + " | AppealToken: " + appealToken);

        log.warn("User account paused: {} (ID: {}) -> Status: {}", user.getEmail(), user.getId(), targetStatus);
    }

    public boolean isUnderage(String dobString) {
        if (dobString == null || dobString.trim().isEmpty()) return false;
        try {
            LocalDate dob = LocalDate.parse(dobString.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
            LocalDate now = LocalDate.now();
            return Period.between(dob, now).getYears() < 18;
        } catch (Exception e) {
            return false;
        }
    }

    // Public Appeal Token Validation
    public AccountAppeal validateAppealToken(String token) {
        AccountAppeal appeal = accountAppealRepository.findByAppealToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid appeal token"));

        if (appeal.getTokenExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("This appeal link has expired. Please contact support@legalease.com.");
        }

        if (appeal.getStatus() != AccountAppeal.AppealStatus.PENDING) {
            throw new UnauthorizedException("An appeal for this token has already been submitted or processed.");
        }

        return appeal;
    }

    // Public Appeal Submission
    @Transactional
    public void submitAppeal(String token, String reason, MultipartFile idImage, MultipartFile selfieImage) {
        AccountAppeal appeal = validateAppealToken(token);

        try {
            // Save encrypted Govt ID Image
            if (idImage != null && !idImage.isEmpty()) {
                byte[] idBytes = idImage.getBytes();
                AesEncryptionUtil.EncryptedData encId = aesEncryptionUtil.encryptFileGcm(idBytes);
                String idFilename = "appeal_id_" + appeal.getId() + "_" + System.currentTimeMillis() + ".enc";
                saveEncryptedFile(idFilename, encId.getCipherBytes());
                appeal.setGovtIdImagePath(idFilename);
                appeal.setGovtIdImageIv(encId.getBase64Iv());
            }

            // Save encrypted Selfie Image
            if (selfieImage != null && !selfieImage.isEmpty()) {
                byte[] selfieBytes = selfieImage.getBytes();
                AesEncryptionUtil.EncryptedData encSelfie = aesEncryptionUtil.encryptFileGcm(selfieBytes);
                String selfieFilename = "appeal_selfie_" + appeal.getId() + "_" + System.currentTimeMillis() + ".enc";
                saveEncryptedFile(selfieFilename, encSelfie.getCipherBytes());
                appeal.setSelfieImagePath(selfieFilename);
                appeal.setSelfieImageIv(encSelfie.getBase64Iv());
            }

            appeal.setReason(reason);
            // Invalidate token so it cannot be resubmitted
            appeal.setTokenExpiresAt(LocalDateTime.now());
            accountAppealRepository.save(appeal);

            log.info("Appeal submitted successfully for appeal ID: {}, user: {}", appeal.getId(), appeal.getUser().getEmail());
        } catch (Exception e) {
            log.error("Failed to submit appeal", e);
            throw new RuntimeException("Appeal submission failed: " + e.getMessage());
        }
    }

    // Admin Review Appeal: Approve
    @Transactional
    public void approveAppeal(Long appealId, User adminReviewer) {
        AccountAppeal appeal = accountAppealRepository.findById(appealId)
                .orElseThrow(() -> new ResourceNotFoundException("Appeal not found with id: " + appealId));

        appeal.setStatus(AccountAppeal.AppealStatus.APPROVED);
        appeal.setReviewedBy(adminReviewer);
        appeal.setReviewedAt(LocalDateTime.now());
        accountAppealRepository.save(appeal);

        // Restore user to ACTIVE
        User user = appeal.getUser();
        user.setAccountStatus(User.AccountStatus.ACTIVE);
        user.setDisableReason(null);
        user.setFailedLoginCount(0);
        userRepository.save(user);

        // Remove from Redis blacklisted users
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForSet().remove("blacklisted_users", String.valueOf(user.getId()));
            }
        } catch (Exception ignored) {
        }

        // Send Email 3 (Appeal Approved)
        emailService.sendAppealApprovedEmail(user.getEmail(), user.getFullName());
        log.info("Appeal #{} APPROVED by admin {}. User {} restored to ACTIVE.",
                appealId, adminReviewer.getEmail(), user.getEmail());
    }

    // Admin Review Appeal: Reject
    @Transactional
    public void rejectAppeal(Long appealId, String rejectionReason, User adminReviewer) {
        AccountAppeal appeal = accountAppealRepository.findById(appealId)
                .orElseThrow(() -> new ResourceNotFoundException("Appeal not found with id: " + appealId));

        appeal.setStatus(AccountAppeal.AppealStatus.REJECTED);
        appeal.setRejectionReason(rejectionReason);
        appeal.setReviewedBy(adminReviewer);
        appeal.setReviewedAt(LocalDateTime.now());
        accountAppealRepository.save(appeal);

        User user = appeal.getUser();
        user.setAccountStatus(User.AccountStatus.DISABLED);
        user.setDisableReason("Appeal rejected: " + rejectionReason);
        userRepository.save(user);

        // Send Email 4 (Appeal Rejected)
        emailService.sendAppealRejectedEmail(user.getEmail(), user.getFullName(), rejectionReason);
        log.info("Appeal #{} REJECTED by admin {}. Reason: {}",
                appealId, adminReviewer.getEmail(), rejectionReason);
    }

    private void saveEncryptedFile(String filename, byte[] bytes) throws Exception {
        File dir = new File(appealDocsDir);
        if (!dir.exists()) dir.mkdirs();
        File target = new File(dir, filename);
        try (FileOutputStream fos = new FileOutputStream(target)) {
            fos.write(bytes);
        }
    }
}

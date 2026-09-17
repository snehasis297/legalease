package com.legalease.service;

import com.legalease.dto.response.*;
import com.legalease.entity.*;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.repository.*;
import com.legalease.util.IdValidationUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final VerificationDocumentRepository verificationDocumentRepository;
    private final DocumentRepository documentRepository;
    private final AuditLogRepository auditLogRepository;
    private final SuspiciousActivityRepository suspiciousActivityRepository;
    private final IpBlacklistRepository ipBlacklistRepository;
    private final AccountAppealRepository accountAppealRepository;
    private final VerificationService verificationService;
    private final AccountSafetyService accountSafetyService;
    private final DocumentService documentService;

    public AdminService(UserRepository userRepository,
                        LawyerProfileRepository lawyerProfileRepository,
                        VerificationDocumentRepository verificationDocumentRepository,
                        DocumentRepository documentRepository,
                        AuditLogRepository auditLogRepository,
                        SuspiciousActivityRepository suspiciousActivityRepository,
                        IpBlacklistRepository ipBlacklistRepository,
                        AccountAppealRepository accountAppealRepository,
                        VerificationService verificationService,
                        AccountSafetyService accountSafetyService,
                        DocumentService documentService) {
        this.userRepository = userRepository;
        this.lawyerProfileRepository = lawyerProfileRepository;
        this.verificationDocumentRepository = verificationDocumentRepository;
        this.documentRepository = documentRepository;
        this.auditLogRepository = auditLogRepository;
        this.suspiciousActivityRepository = suspiciousActivityRepository;
        this.ipBlacklistRepository = ipBlacklistRepository;
        this.accountAppealRepository = accountAppealRepository;
        this.verificationService = verificationService;
        this.accountSafetyService = accountSafetyService;
        this.documentService = documentService;
    }

    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToAdminUserResponse);
    }

    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToAdminUserResponse(user);
    }

    @Transactional
    public AdminUserResponse updateUserRole(Long id, String roleStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        user.setRole(User.Role.valueOf(roleStr.toUpperCase()));
        return mapToAdminUserResponse(userRepository.save(user));
    }

    @Transactional
    public AdminUserResponse updateUserStatus(Long id, String statusStr, String reason) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        User.AccountStatus newStatus = User.AccountStatus.valueOf(statusStr.toUpperCase());

        if (newStatus == User.AccountStatus.DISABLED || newStatus == User.AccountStatus.SUSPENDED) {
            accountSafetyService.disableAccount(user, newStatus, reason != null ? reason : "Admin updated status to " + newStatus, AccountAppeal.AppealType.DISABLED_ACCOUNT);
        } else {
            user.setAccountStatus(newStatus);
            user.setDisableReason(reason);
            userRepository.save(user);
        }

        return mapToAdminUserResponse(user);
    }

    public Page<LawyerProfile> getVerificationQueue(Pageable pageable) {
        return lawyerProfileRepository.findByVerificationStatus(LawyerProfile.VerificationStatus.PENDING, pageable);
    }

    public List<VerificationDocument> getLawyerDocuments(Long lawyerUserId) {
        return verificationDocumentRepository.findByUserId(lawyerUserId);
    }

    @Transactional
    public void approveLawyerVerification(Long lawyerUserId, User adminUser) {
        verificationService.approveLawyer(lawyerUserId, adminUser);
    }

    @Transactional
    public void rejectLawyerVerification(Long lawyerUserId, String reason, User adminUser) {
        verificationService.rejectLawyer(lawyerUserId, reason, adminUser);
    }

    public Page<DocumentResponse> getAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable).map(documentService::mapToResponse);
    }

    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public Page<SuspiciousActivityResponse> getSuspiciousActivities(Pageable pageable) {
        return suspiciousActivityRepository.findAllByOrderByDetectedAtDesc(pageable).map(sa -> {
            SuspiciousActivityResponse resp = new SuspiciousActivityResponse();
            resp.setId(sa.getId());
            if (sa.getUser() != null) {
                resp.setUserId(sa.getUser().getId());
                resp.setUserEmail(sa.getUser().getEmail());
                resp.setUserFullName(sa.getUser().getFullName());
            }
            resp.setIpAddress(sa.getIpAddress());
            resp.setActivityType(sa.getActivityType().name());
            resp.setDetails(sa.getDetails());
            resp.setSeverity(sa.getSeverity().name());
            resp.setIsResolved(sa.getIsResolved());
            resp.setDetectedAt(sa.getDetectedAt());
            return resp;
        });
    }

    @Transactional
    public void resolveSuspiciousActivity(Long id) {
        SuspiciousActivity sa = suspiciousActivityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + id));
        sa.setIsResolved(true);
        suspiciousActivityRepository.save(sa);
    }

    public Page<IpBlacklist> getIpBlacklist(Pageable pageable) {
        return ipBlacklistRepository.findAllByOrderByBlockedAtDesc(pageable);
    }

    @Transactional
    public IpBlacklist blockIp(String ipAddress, String reason, Integer durationMinutes, Boolean permanent, User adminUser) {
        LocalDateTime blockedUntil = Boolean.TRUE.equals(permanent) ? null : LocalDateTime.now().plusMinutes(durationMinutes != null ? durationMinutes : 60);
        IpBlacklist entry = ipBlacklistRepository.findByIpAddress(ipAddress).orElse(new IpBlacklist());
        entry.setIpAddress(ipAddress);
        entry.setReason(reason);
        entry.setBlockedUntil(blockedUntil);
        entry.setBlockedBy(adminUser);
        entry.setIsPermanent(Boolean.TRUE.equals(permanent));
        return ipBlacklistRepository.save(entry);
    }

    @Transactional
    public void unblockIp(Long id) {
        ipBlacklistRepository.deleteById(id);
    }

    public Page<AppealResponse> getAppeals(Pageable pageable) {
        return accountAppealRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToAppealResponse);
    }

    public AppealResponse getAppealById(Long id) {
        AccountAppeal appeal = accountAppealRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appeal not found with id: " + id));
        return mapToAppealResponse(appeal);
    }

    @Transactional
    public void approveAppeal(Long id, User adminUser) {
        accountSafetyService.approveAppeal(id, adminUser);
    }

    @Transactional
    public void rejectAppeal(Long id, String reason, User adminUser) {
        accountSafetyService.rejectAppeal(id, reason, adminUser);
    }

    public Map<String, Object> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByAccountStatus(User.AccountStatus.ACTIVE));
        stats.put("totalLawyers", userRepository.countByRole(User.Role.LAWYER));
        stats.put("pendingLawyers", lawyerProfileRepository.countByVerificationStatus(LawyerProfile.VerificationStatus.PENDING));
        stats.put("totalDocuments", documentRepository.count());
        stats.put("pendingDocuments", documentRepository.countByStatus(Document.DocumentStatus.PENDING));
        stats.put("processingDocuments", documentRepository.countByStatus(Document.DocumentStatus.PROCESSING));
        stats.put("analyzedDocuments", documentRepository.countByStatus(Document.DocumentStatus.DONE));
        stats.put("pendingAppeals", accountAppealRepository.countByStatus(AccountAppeal.AppealStatus.PENDING));
        stats.put("unresolvedThreats", suspiciousActivityRepository.countByIsResolvedFalse());
        return stats;
    }

    private AdminUserResponse mapToAdminUserResponse(User u) {
        AdminUserResponse resp = new AdminUserResponse();
        resp.setId(u.getId());
        resp.setFullName(u.getFullName());
        resp.setEmail(u.getEmail());
        resp.setMaskedPhone(IdValidationUtil.maskPhoneNumber(u.getPhoneNumber()));
        resp.setRole(u.getRole().name());
        resp.setAccountStatus(u.getAccountStatus().name());
        resp.setFailedLoginCount(u.getFailedLoginCount());
        resp.setLastLoginAt(u.getLastLoginAt());
        resp.setLastLoginIp(u.getLastLoginIp());
        resp.setLoginCount(u.getLoginCount());
        resp.setIsEmailVerified(u.getIsEmailVerified());
        resp.setIsPhoneVerified(u.getIsPhoneVerified());
        resp.setIsIdVerified(u.getIsIdVerified());
        resp.setIsTotpEnabled(u.getIsTotpEnabled());
        resp.setDisableReason(u.getDisableReason());
        resp.setCreatedAt(u.getCreatedAt());
        return resp;
    }

    private AppealResponse mapToAppealResponse(AccountAppeal a) {
        AppealResponse resp = new AppealResponse();
        resp.setId(a.getId());
        resp.setUserId(a.getUser().getId());
        resp.setUserFullName(a.getUser().getFullName());
        resp.setUserEmail(a.getUser().getEmail());
        resp.setAppealType(a.getAppealType().name());
        resp.setReason(a.getReason());
        resp.setStatus(a.getStatus().name());
        resp.setHasGovtIdImage(a.getGovtIdImagePath() != null);
        resp.setHasSelfieImage(a.getSelfieImagePath() != null);
        resp.setAppealToken(a.getAppealToken());
        resp.setTokenExpiresAt(a.getTokenExpiresAt());
        if (a.getReviewedBy() != null) {
            resp.setReviewedByName(a.getReviewedBy().getFullName());
        }
        resp.setReviewedAt(a.getReviewedAt());
        resp.setRejectionReason(a.getRejectionReason());
        resp.setCreatedAt(a.getCreatedAt());
        return resp;
    }
}

package com.legalease.controller;

import com.legalease.dto.response.*;
import com.legalease.entity.AuditLog;
import com.legalease.entity.IpBlacklist;
import com.legalease.entity.LawyerProfile;
import com.legalease.entity.User;
import com.legalease.entity.VerificationDocument;
import com.legalease.repository.UserRepository;
import com.legalease.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    public AdminController(AdminService adminService, UserRepository userRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedAdmin(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> getUsers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", adminService.getAllUsers(pageable)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.ok("User retrieved", adminService.getUserById(id)));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserRole(@PathVariable("id") Long id,
                                                                         @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("User role updated", adminService.updateUserRole(id, body.get("role"))));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(@PathVariable("id") Long id,
                                                                           @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok("User status updated",
                adminService.updateUserStatus(id, body.get("status"), body.get("reason"))));
    }

    @GetMapping({"/verification-queue", "/verifications"})
    public ResponseEntity<ApiResponse<Page<LawyerProfile>>> getVerificationQueue(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        return ResponseEntity.ok(ApiResponse.ok("Queue retrieved", adminService.getVerificationQueue(pageable)));
    }

    @GetMapping({"/verification/{id}", "/verifications/{id}"})
    public ResponseEntity<ApiResponse<LawyerProfile>> getVerificationById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Verification details retrieved", adminService.getLawyerProfileById(id)));
    }

    @GetMapping({"/verification/{userId}/documents", "/verifications/{userId}/documents"})
    public ResponseEntity<ApiResponse<List<VerificationDocument>>> getLawyerDocuments(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(ApiResponse.ok("Lawyer verification documents retrieved", adminService.getLawyerDocuments(userId)));
    }

    @PutMapping({"/verification/{userId}/approve", "/verifications/{userId}/approve"})
    public ResponseEntity<ApiResponse<Void>> approveLawyer(@PathVariable("userId") Long userId,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getAuthenticatedAdmin(userDetails);
        adminService.approveLawyerVerification(userId, admin);
        return ResponseEntity.ok(ApiResponse.ok("Lawyer successfully approved. Account is now ACTIVE."));
    }

    @PutMapping({"/verification/{userId}/reject", "/verifications/{userId}/reject"})
    public ResponseEntity<ApiResponse<Void>> rejectLawyer(@PathVariable("userId") Long userId,
                                                          @RequestBody Map<String, String> body,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getAuthenticatedAdmin(userDetails);
        adminService.rejectLawyerVerification(userId, body.get("reason"), admin);
        return ResponseEntity.ok(ApiResponse.ok("Lawyer verification rejected."));
    }

    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getAllDocuments(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadTime"));
        return ResponseEntity.ok(ApiResponse.ok("All documents retrieved", adminService.getAllDocuments(pageable)));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return ResponseEntity.ok(ApiResponse.ok("Audit logs retrieved", adminService.getAuditLogs(pageable)));
    }

    @GetMapping({"/suspicious-activities", "/suspicious"})
    public ResponseEntity<ApiResponse<Page<SuspiciousActivityResponse>>> getSuspiciousActivities(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "detectedAt"));
        return ResponseEntity.ok(ApiResponse.ok("Threat events retrieved", adminService.getSuspiciousActivities(pageable)));
    }

    @PutMapping({"/suspicious-activities/{id}/resolve", "/suspicious/{id}/resolve"})
    public ResponseEntity<ApiResponse<Void>> resolveSuspiciousActivity(@PathVariable("id") Long id) {
        adminService.resolveSuspiciousActivity(id);
        return ResponseEntity.ok(ApiResponse.ok("Suspicious activity marked as resolved."));
    }

    @GetMapping({"/ip-blacklist", "/blacklist"})
    public ResponseEntity<ApiResponse<Page<IpBlacklist>>> getIpBlacklist(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "blockedAt"));
        return ResponseEntity.ok(ApiResponse.ok("Blacklist retrieved", adminService.getIpBlacklist(pageable)));
    }

    @PostMapping({"/ip-blacklist", "/blacklist"})
    public ResponseEntity<ApiResponse<IpBlacklist>> blockIp(@RequestBody Map<String, Object> body,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getAuthenticatedAdmin(userDetails);
        String ip = (String) body.get("ipAddress");
        String reason = (String) body.get("reason");
        Integer duration = body.get("durationMinutes") != null ? ((Number) body.get("durationMinutes")).intValue() : 60;
        Boolean permanent = body.get("permanent") != null ? (Boolean) body.get("permanent") : false;

        IpBlacklist entry = adminService.blockIp(ip, reason, duration, permanent, admin);
        return ResponseEntity.ok(ApiResponse.ok("IP blocked successfully", entry));
    }

    @DeleteMapping({"/ip-blacklist/{id}", "/blacklist/{id}"})
    public ResponseEntity<ApiResponse<Void>> unblockIp(@PathVariable("id") Long id) {
        adminService.unblockIp(id);
        return ResponseEntity.ok(ApiResponse.ok("IP removed from blacklist."));
    }

    @GetMapping("/appeals")
    public ResponseEntity<ApiResponse<Page<AppealResponse>>> getAppeals(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.ok("Appeals retrieved", adminService.getAppeals(pageable)));
    }

    @GetMapping("/appeals/{id}")
    public ResponseEntity<ApiResponse<AppealResponse>> getAppealById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(ApiResponse.ok("Appeal details retrieved", adminService.getAppealById(id)));
    }

    @PutMapping("/appeals/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveAppeal(@PathVariable("id") Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getAuthenticatedAdmin(userDetails);
        adminService.approveAppeal(id, admin);
        return ResponseEntity.ok(ApiResponse.ok("Appeal approved. Account restored to ACTIVE."));
    }

    @PutMapping("/appeals/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectAppeal(@PathVariable("id") Long id,
                                                          @RequestBody Map<String, String> body,
                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User admin = getAuthenticatedAdmin(userDetails);
        adminService.rejectAppeal(id, body.get("reason"), admin);
        return ResponseEntity.ok(ApiResponse.ok("Appeal rejected."));
    }

    @GetMapping({"/stats", "/dashboard/stats"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok("System stats retrieved", adminService.getSystemStats()));
    }
}

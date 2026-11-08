package com.legalease.controller;

import com.legalease.dto.response.AnalysisResponse;
import com.legalease.dto.response.ApiResponse;
import com.legalease.dto.response.DocumentResponse;
import com.legalease.entity.LawyerProfile;
import com.legalease.entity.User;
import com.legalease.repository.UserRepository;
import com.legalease.service.LawyerService;
import com.legalease.service.VerificationService;
import com.legalease.util.DeviceFingerprintUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/lawyer")
@PreAuthorize("hasRole('LAWYER')")
public class LawyerController {

    private final LawyerService lawyerService;
    private final VerificationService verificationService;
    private final UserRepository userRepository;
    private final DeviceFingerprintUtil deviceFingerprintUtil;

    public LawyerController(LawyerService lawyerService,
                            VerificationService verificationService,
                            UserRepository userRepository,
                            DeviceFingerprintUtil deviceFingerprintUtil) {
        this.lawyerService = lawyerService;
        this.verificationService = verificationService;
        this.userRepository = userRepository;
        this.deviceFingerprintUtil = deviceFingerprintUtil;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @PostMapping(value = "/kyc/upload-documents", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<Void>> uploadDocuments(
            @RequestParam("barCouncilId") String barCouncilId,
            @RequestParam("barCouncilState") String barCouncilState,
            @RequestParam("yearsOfExperience") Integer yearsOfExperience,
            @RequestParam("specialization") String specialization,
            @RequestParam("barCouncilCertificate") MultipartFile barCert,
            @RequestParam("degreeCertificate") MultipartFile degreeCert,
            @RequestParam("govtIdFront") MultipartFile govtIdFront,
            @RequestParam("govtIdBack") MultipartFile govtIdBack,
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {

        User lawyer = getAuthenticatedUser(userDetails);
        String clientIp = deviceFingerprintUtil.getClientIp(request);

        verificationService.uploadLawyerDocuments(
                lawyer, barCouncilId, barCouncilState, yearsOfExperience, specialization,
                barCert, degreeCert, govtIdFront, govtIdBack, clientIp);

        return ResponseEntity.ok(ApiResponse.ok("Verification documents uploaded successfully. Awaiting administrator review."));
    }

    @GetMapping("/kyc/status")
    public ResponseEntity<ApiResponse<LawyerProfile>> getKycStatus(@AuthenticationPrincipal UserDetails userDetails) {
        User lawyer = getAuthenticatedUser(userDetails);
        LawyerProfile profile = lawyerService.getLawyerKycStatus(lawyer);
        return ResponseEntity.ok(ApiResponse.ok("KYC status retrieved", profile));
    }

    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getAssignedDocuments(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User lawyer = getAuthenticatedUser(userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadTime"));
        Page<DocumentResponse> docs = lawyerService.getAssignedDocuments(lawyer, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Assigned documents retrieved", docs));
    }

    @GetMapping({"/reviews/pending", "/contracts/pending"})
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getPendingReviews(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        User lawyer = getAuthenticatedUser(userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadTime"));
        Page<DocumentResponse> docs = lawyerService.getPendingReviews(lawyer, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Pending client contract reviews retrieved", docs));
    }

    @PostMapping({"/reviews/{id}", "/documents/{id}/review"})
    public ResponseEntity<ApiResponse<DocumentResponse>> submitReview(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User lawyer = getAuthenticatedUser(userDetails);
        String riskLevel = body.getOrDefault("riskLevel", body.getOrDefault("lawyerRiskLevel", "LOW"));
        String notes = body.getOrDefault("notes", body.getOrDefault("lawyerNotes", ""));
        String recommendations = body.getOrDefault("recommendations", body.getOrDefault("lawyerRecommendations", ""));

        DocumentResponse doc = lawyerService.submitReview(id, riskLevel, notes, recommendations, lawyer);
        return ResponseEntity.ok(ApiResponse.ok("Counsel legal review certified and dispatched to client.", doc));
    }

    @PutMapping("/documents/{id}/notes")
    public ResponseEntity<ApiResponse<DocumentResponse>> updateNotes(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User lawyer = getAuthenticatedUser(userDetails);
        DocumentResponse doc = lawyerService.updateDocumentNotes(id, body.get("notes"), lawyer);
        return ResponseEntity.ok(ApiResponse.ok("Review notes saved", doc));
    }

    @GetMapping("/documents/{id}/analysis")
    public ResponseEntity<ApiResponse<AnalysisResponse>> getDocumentAnalysis(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User lawyer = getAuthenticatedUser(userDetails);
        AnalysisResponse analysis = lawyerService.getDocumentAnalysis(id, lawyer);
        return ResponseEntity.ok(ApiResponse.ok("Analysis retrieved", analysis));
    }
}

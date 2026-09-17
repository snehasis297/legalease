package com.legalease.controller;

import com.legalease.dto.response.ApiResponse;
import com.legalease.dto.response.DocumentResponse;
import com.legalease.entity.Document;
import com.legalease.entity.User;
import com.legalease.repository.UserRepository;
import com.legalease.service.AnalysisService;
import com.legalease.service.DocumentService;
import com.legalease.util.DeviceFingerprintUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@PreAuthorize("isAuthenticated()")
public class DocumentController {

    private final DocumentService documentService;
    private final AnalysisService analysisService;
    private final UserRepository userRepository;
    private final DeviceFingerprintUtil deviceFingerprintUtil;

    public DocumentController(DocumentService documentService,
                              AnalysisService analysisService,
                              UserRepository userRepository,
                              DeviceFingerprintUtil deviceFingerprintUtil) {
        this.documentService = documentService;
        this.analysisService = analysisService;
        this.userRepository = userRepository;
        this.deviceFingerprintUtil = deviceFingerprintUtil;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(@RequestParam("file") MultipartFile file,
                                                                        @AuthenticationPrincipal UserDetails userDetails,
                                                                        HttpServletRequest request) {
        User user = getAuthenticatedUser(userDetails);
        String clientIp = deviceFingerprintUtil.getClientIp(request);

        Document doc = documentService.uploadDocument(user, file, clientIp);

        // Trigger Async Analysis
        analysisService.analyzeDocumentAsync(doc.getId());

        DocumentResponse resp = documentService.mapToResponse(doc);
        return ResponseEntity.ok(ApiResponse.ok("Document uploaded successfully. Analysis in progress.", resp));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> getDocuments(@RequestParam(name = "page", defaultValue = "0") int page,
                                                                            @RequestParam(name = "size", defaultValue = "10") int size,
                                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadTime"));
        Page<DocumentResponse> result = documentService.getUserDocuments(user, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Documents retrieved", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(@PathVariable("id") Long id,
                                                                     @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        DocumentResponse resp = documentService.getDocumentDetails(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Document details retrieved", resp));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable("id") Long id,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        documentService.deleteDocument(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted successfully."));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable("id") Long id,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        DocumentResponse doc = documentService.getDocumentDetails(id, user);
        byte[] decryptedBytes = documentService.downloadDecryptedDocument(id, user);

        MediaType mediaType = MediaType.APPLICATION_PDF;
        if (doc.getMimeType() != null && doc.getMimeType().contains("word")) {
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getOriginalFilename() + "\"")
                .body(decryptedBytes);
    }
}

package com.legalease.service;

import com.legalease.dto.response.DocumentResponse;
import com.legalease.entity.Clause;
import com.legalease.entity.Document;
import com.legalease.entity.DocumentAnalysis;
import com.legalease.entity.User;
import com.legalease.exception.FileProcessingException;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import org.springframework.security.access.AccessDeniedException;
import com.legalease.repository.ClauseRepository;
import com.legalease.repository.DocumentAnalysisRepository;
import com.legalease.repository.DocumentRepository;
import com.legalease.util.AesEncryptionUtil;
import com.legalease.util.FileValidationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.nio.file.Files;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentService.class);

    private final DocumentRepository documentRepository;
    private final DocumentAnalysisRepository documentAnalysisRepository;
    private final ClauseRepository clauseRepository;
    private final FileValidationUtil fileValidationUtil;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final RateLimitService rateLimitService;
    private final ThreatDetectionService threatDetectionService;

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentAnalysisRepository documentAnalysisRepository,
                           ClauseRepository clauseRepository,
                           FileValidationUtil fileValidationUtil,
                           AesEncryptionUtil aesEncryptionUtil,
                           RateLimitService rateLimitService,
                           ThreatDetectionService threatDetectionService) {
        this.documentRepository = documentRepository;
        this.documentAnalysisRepository = documentAnalysisRepository;
        this.clauseRepository = clauseRepository;
        this.fileValidationUtil = fileValidationUtil;
        this.aesEncryptionUtil = aesEncryptionUtil;
        this.rateLimitService = rateLimitService;
        this.threatDetectionService = threatDetectionService;
    }

    @Transactional
    public Document uploadDocument(User user, MultipartFile file, String clientIp) {
        if (file == null || file.isEmpty()) {
            throw new FileProcessingException("No file provided for upload");
        }

        // Rate limit: 10 uploads per user per hour
        rateLimitService.checkRateLimit("upload", String.valueOf(user.getId()), 10, 3600);

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) originalFilename = "document.pdf";

        // Magic bytes check
        byte[] header = fileValidationUtil.extractHeader(file);
        FileValidationUtil.DetectedFileType detectedType =
                fileValidationUtil.validateMagicBytes(header, originalFilename, file.getContentType());

        if (detectedType == FileValidationUtil.DetectedFileType.UNKNOWN) {
            threatDetectionService.recordMaliciousFile(user, clientIp, originalFilename, "Magic byte validation mismatch");
        }

        try {
            byte[] fileBytes = file.getBytes();
            // Encrypt using AES-256-GCM
            AesEncryptionUtil.EncryptedData encryptedData = aesEncryptionUtil.encryptFileGcm(fileBytes);

            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String storedFilename = UUID.randomUUID().toString() + ".enc";
            File targetFile = new File(dir, storedFilename);
            try (FileOutputStream fos = new FileOutputStream(targetFile)) {
                fos.write(encryptedData.getCipherBytes());
            }

            Document document = new Document(
                    user,
                    originalFilename,
                    storedFilename,
                    targetFile.getAbsolutePath(),
                    file.getSize(),
                    file.getContentType(),
                    encryptedData.getBase64Iv()
            );
            document.setReviewStatus("PENDING_REVIEW");
            document.setFinalRiskStatus("PENDING_LAWYER");
            return documentRepository.save(document);
        } catch (Exception e) {
            log.error("File upload failed", e);
            throw new FileProcessingException("Failed to process and store document: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public byte[] downloadDecryptedDocument(Long documentId, User requestingUser) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        boolean isOwner = document.getUser().getId().equals(requestingUser.getId());
        boolean isAdmin = requestingUser.getRole() == User.Role.ADMIN;
        boolean isLawyer = requestingUser.getRole() == User.Role.LAWYER;
        boolean isAssignedLawyer = document.getAssignedLawyer() != null &&
                document.getAssignedLawyer().getId().equals(requestingUser.getId());

        if (!isOwner && !isAdmin && !isAssignedLawyer && !isLawyer) {
            throw new AccessDeniedException("You do not have permission to access this document");
        }

        try {
            File encryptedFile = new File(document.getFilePath());
            if (!encryptedFile.exists()) {
                throw new ResourceNotFoundException("Encrypted document file is missing from storage");
            }
            byte[] cipherBytes = Files.readAllBytes(encryptedFile.toPath());
            return aesEncryptionUtil.decryptFileGcm(cipherBytes, document.getEncryptionIv());
        } catch (Exception e) {
            log.error("Failed to decrypt document id {}", documentId, e);
            throw new FileProcessingException("Decryption failed for document: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getUserDocuments(User user, Pageable pageable) {
        return documentRepository.findByUser(user, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentDetails(Long documentId, User requestingUser) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        boolean isOwner = document.getUser().getId().equals(requestingUser.getId());
        boolean isAdmin = requestingUser.getRole() == User.Role.ADMIN;
        boolean isLawyer = requestingUser.getRole() == User.Role.LAWYER;
        boolean isAssignedLawyer = document.getAssignedLawyer() != null &&
                document.getAssignedLawyer().getId().equals(requestingUser.getId());

        if (!isOwner && !isAdmin && !isAssignedLawyer && !isLawyer) {
            throw new AccessDeniedException("You do not have access to this document");
        }

        return mapToResponse(document);
    }

    @Transactional
    public void deleteDocument(Long documentId, User requestingUser) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        boolean isOwner = document.getUser().getId().equals(requestingUser.getId());
        boolean isAdmin = requestingUser.getRole() == User.Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to delete this document");
        }

        // Delete clauses and analysis
        clauseRepository.deleteByDocumentId(documentId);
        documentAnalysisRepository.findByDocumentId(documentId).ifPresent(documentAnalysisRepository::delete);

        // Delete physical file
        try {
            File f = new File(document.getFilePath());
            if (f.exists()) f.delete();
        } catch (Exception ignored) {
        }

        documentRepository.delete(document);
        log.info("Document #{} deleted by user {}", documentId, requestingUser.getEmail());
    }

    public DocumentResponse mapToResponse(Document doc) {
        DocumentResponse resp = new DocumentResponse();
        resp.setId(doc.getId());
        resp.setUserId(doc.getUser().getId());
        resp.setUploaderName(doc.getUser().getFullName());
        resp.setOriginalFilename(doc.getOriginalFilename());
        resp.setFileSize(doc.getFileSize());
        resp.setMimeType(doc.getMimeType());
        resp.setStatus(doc.getStatus().name());
        resp.setUploadTime(doc.getUploadTime());
        if (doc.getAssignedLawyer() != null) {
            resp.setAssignedLawyerId(doc.getAssignedLawyer().getId());
            resp.setAssignedLawyerName(doc.getAssignedLawyer().getFullName());
        }
        resp.setLawyerNotes(doc.getLawyerNotes());
        resp.setLawyerRiskLevel(doc.getLawyerRiskLevel());
        resp.setLawyerRecommendations(doc.getLawyerRecommendations());
        resp.setLawyerReviewedAt(doc.getLawyerReviewedAt());
        resp.setReviewStatus(doc.getReviewStatus() != null ? doc.getReviewStatus() : "PENDING_REVIEW");
        resp.setFinalRiskStatus(doc.getFinalRiskStatus());
        resp.setFinalRiskLabel(doc.getFinalRiskLabel());

        documentAnalysisRepository.findByDocumentId(doc.getId()).ifPresent(analysis -> {
            resp.setRiskScore(analysis.getRiskScore());
            resp.setRiskLevel(analysis.getRiskLevel() != null ? analysis.getRiskLevel().name() : null);
        });

        return resp;
    }
}

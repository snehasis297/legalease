package com.legalease.service;

import com.legalease.dto.response.AnalysisResponse;
import com.legalease.dto.response.DocumentResponse;
import com.legalease.entity.Document;
import com.legalease.entity.DocumentAnalysis;
import com.legalease.entity.LawyerProfile;
import com.legalease.entity.Notification;
import com.legalease.entity.User;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import com.legalease.repository.DocumentAnalysisRepository;
import com.legalease.repository.DocumentRepository;
import com.legalease.repository.LawyerProfileRepository;
import com.legalease.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LawyerService {

    private final DocumentRepository documentRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final DocumentAnalysisRepository documentAnalysisRepository;
    private final NotificationRepository notificationRepository;
    private final DocumentService documentService;
    private final AnalysisService analysisService;

    public LawyerService(DocumentRepository documentRepository,
                         LawyerProfileRepository lawyerProfileRepository,
                         DocumentAnalysisRepository documentAnalysisRepository,
                         NotificationRepository notificationRepository,
                         DocumentService documentService,
                         AnalysisService analysisService) {
        this.documentRepository = documentRepository;
        this.lawyerProfileRepository = lawyerProfileRepository;
        this.documentAnalysisRepository = documentAnalysisRepository;
        this.notificationRepository = notificationRepository;
        this.documentService = documentService;
        this.analysisService = analysisService;
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getAssignedDocuments(User lawyer, Pageable pageable) {
        return documentRepository.findAssignedOrUnassignedForLawyer(lawyer, pageable).map(documentService::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<DocumentResponse> getPendingReviews(User lawyer, Pageable pageable) {
        return documentRepository.findAssignedOrUnassignedForLawyer(lawyer, pageable).map(documentService::mapToResponse);
    }

    @Transactional
    public DocumentResponse submitReview(Long documentId, String riskLevel, String notes, String recommendations, User lawyer) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (document.getAssignedLawyer() != null && !document.getAssignedLawyer().getId().equals(lawyer.getId()) && lawyer.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("This document is already assigned to another counsel");
        }

        document.setAssignedLawyer(lawyer);
        document.setLawyerRiskLevel(riskLevel != null && !riskLevel.isBlank() ? riskLevel.toUpperCase() : "LOW");
        document.setLawyerNotes(notes != null ? notes : "");
        document.setLawyerRecommendations(recommendations != null ? recommendations : "");
        document.setLawyerReviewedAt(LocalDateTime.now());
        document.setReviewStatus("REVIEWED");

        // Determine Final Risk Status
        DocumentAnalysis analysis = documentAnalysisRepository.findByDocumentId(documentId).orElse(null);
        String aiRisk = analysis != null && analysis.getRiskLevel() != null ? analysis.getRiskLevel().name() : "LOW";
        String lRisk = document.getLawyerRiskLevel();

        if ("LOW".equalsIgnoreCase(aiRisk) && "LOW".equalsIgnoreCase(lRisk)) {
            document.setFinalRiskStatus("LOW_RISK_VERIFIED");
        } else if ("HIGH".equalsIgnoreCase(aiRisk) || "HIGH".equalsIgnoreCase(lRisk)) {
            document.setFinalRiskStatus("HIGH_RISK");
        } else {
            document.setFinalRiskStatus("MEDIUM_RISK");
        }

        Document saved = documentRepository.save(document);

        // Real-Time Notification dispatched to Client
        if (document.getUser() != null) {
            String notifTitle = "Lawyer Certified Review: " + document.getOriginalFilename();
            String notifMsg = "Advocate " + (lawyer.getFullName() != null ? lawyer.getFullName() : "Counsel")
                    + " has completed the professional legal review. Independent Counsel Assessment: " + lRisk + " RISK.";
            notificationRepository.save(new Notification(document.getUser(), notifTitle, notifMsg, "LAWYER_REVIEW_COMPLETED", documentId));
        }

        return documentService.mapToResponse(saved);
    }

    @Transactional
    public DocumentResponse updateDocumentNotes(Long documentId, String notes, User lawyer) {
        return submitReview(documentId, "LOW", notes, "", lawyer);
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getDocumentAnalysis(Long documentId, User lawyer) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        return analysisService.getDocumentAnalysis(documentId);
    }

    @Transactional(readOnly = true)
    public LawyerProfile getLawyerKycStatus(User lawyer) {
        return lawyerProfileRepository.findByUser(lawyer)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer profile not found"));
    }
}

package com.legalease.service;

import com.legalease.dto.response.AnalysisResponse;
import com.legalease.dto.response.DocumentResponse;
import com.legalease.entity.Document;
import com.legalease.entity.LawyerProfile;
import com.legalease.entity.User;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import com.legalease.repository.DocumentRepository;
import com.legalease.repository.LawyerProfileRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LawyerService {

    private final DocumentRepository documentRepository;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final DocumentService documentService;
    private final AnalysisService analysisService;

    public LawyerService(DocumentRepository documentRepository,
                         LawyerProfileRepository lawyerProfileRepository,
                         DocumentService documentService,
                         AnalysisService analysisService) {
        this.documentRepository = documentRepository;
        this.lawyerProfileRepository = lawyerProfileRepository;
        this.documentService = documentService;
        this.analysisService = analysisService;
    }

    public Page<DocumentResponse> getAssignedDocuments(User lawyer, Pageable pageable) {
        return documentRepository.findByAssignedLawyer(lawyer, pageable).map(documentService::mapToResponse);
    }

    @Transactional
    public DocumentResponse updateDocumentNotes(Long documentId, String notes, User lawyer) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (document.getAssignedLawyer() != null && !document.getAssignedLawyer().getId().equals(lawyer.getId())) {
            throw new UnauthorizedException("This document is not assigned to you");
        }

        // Auto-assign if unassigned
        if (document.getAssignedLawyer() == null) {
            document.setAssignedLawyer(lawyer);
        }

        document.setLawyerNotes(notes);
        Document saved = documentRepository.save(document);
        return documentService.mapToResponse(saved);
    }

    public AnalysisResponse getDocumentAnalysis(Long documentId, User lawyer) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (document.getAssignedLawyer() != null && !document.getAssignedLawyer().getId().equals(lawyer.getId()) && lawyer.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("This document is assigned to another attorney");
        }

        return analysisService.getDocumentAnalysis(documentId);
    }

    public LawyerProfile getLawyerKycStatus(User lawyer) {
        return lawyerProfileRepository.findByUser(lawyer)
                .orElseThrow(() -> new ResourceNotFoundException("Lawyer profile not found"));
    }
}

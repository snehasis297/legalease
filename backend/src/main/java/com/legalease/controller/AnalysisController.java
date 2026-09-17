package com.legalease.controller;

import com.legalease.dto.response.AnalysisResponse;
import com.legalease.dto.response.ApiResponse;
import com.legalease.dto.response.ClauseResponse;
import com.legalease.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@PreAuthorize("isAuthenticated()")
public class AnalysisController {

    private final AnalysisService analysisService;

    public AnalysisController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    @PostMapping("/analyze/{documentId}")
    public ResponseEntity<ApiResponse<Void>> triggerAnalysis(@PathVariable("documentId") Long documentId) {
        analysisService.analyzeDocumentAsync(documentId);
        return ResponseEntity.ok(ApiResponse.ok("Analysis queued for processing"));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<AnalysisResponse>> getAnalysis(@PathVariable("documentId") Long documentId) {
        AnalysisResponse analysis = analysisService.getDocumentAnalysis(documentId);
        return ResponseEntity.ok(ApiResponse.ok("Analysis retrieved successfully", analysis));
    }

    @GetMapping("/{documentId}/clauses")
    public ResponseEntity<ApiResponse<List<ClauseResponse>>> getClauses(@PathVariable("documentId") Long documentId) {
        List<ClauseResponse> clauses = analysisService.getDocumentClauses(documentId);
        return ResponseEntity.ok(ApiResponse.ok("Clauses retrieved successfully", clauses));
    }
}

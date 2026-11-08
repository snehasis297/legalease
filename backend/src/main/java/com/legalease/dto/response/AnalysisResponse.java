package com.legalease.dto.response;

import java.util.List;

public class AnalysisResponse {

    private Long documentId;
    private String originalFilename;
    private String fullSummary;
    private Integer riskScore;
    private String riskLevel;
    private Integer clauseCount;
    private Integer highRiskCount;
    private Integer mediumRiskCount;
    private Integer lowRiskCount;
    private String aiModelUsed;
    private Long analysisDurationMs;
    private List<ClauseResponse> clauses;
    private String assignedLawyerName;
    private String lawyerRiskLevel;
    private String lawyerNotes;
    private String lawyerRecommendations;
    private java.time.LocalDateTime lawyerReviewedAt;
    private String reviewStatus;
    private String finalRiskStatus;
    private String finalRiskLabel;

    public AnalysisResponse() {
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getFullSummary() {
        return fullSummary;
    }

    public void setFullSummary(String fullSummary) {
        this.fullSummary = fullSummary;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Integer getClauseCount() {
        return clauseCount;
    }

    public void setClauseCount(Integer clauseCount) {
        this.clauseCount = clauseCount;
    }

    public Integer getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(Integer highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public Integer getMediumRiskCount() {
        return mediumRiskCount;
    }

    public void setMediumRiskCount(Integer mediumRiskCount) {
        this.mediumRiskCount = mediumRiskCount;
    }

    public Integer getLowRiskCount() {
        return lowRiskCount;
    }

    public void setLowRiskCount(Integer lowRiskCount) {
        this.lowRiskCount = lowRiskCount;
    }

    public String getAiModelUsed() {
        return aiModelUsed;
    }

    public void setAiModelUsed(String aiModelUsed) {
        this.aiModelUsed = aiModelUsed;
    }

    public Long getAnalysisDurationMs() {
        return analysisDurationMs;
    }

    public void setAnalysisDurationMs(Long analysisDurationMs) {
        this.analysisDurationMs = analysisDurationMs;
    }

    public List<ClauseResponse> getClauses() {
        return clauses;
    }

    public void setClauses(List<ClauseResponse> clauses) {
        this.clauses = clauses;
    }

    public String getAssignedLawyerName() {
        return assignedLawyerName;
    }

    public void setAssignedLawyerName(String assignedLawyerName) {
        this.assignedLawyerName = assignedLawyerName;
    }

    public String getLawyerRiskLevel() {
        return lawyerRiskLevel;
    }

    public void setLawyerRiskLevel(String lawyerRiskLevel) {
        this.lawyerRiskLevel = lawyerRiskLevel;
    }

    public String getLawyerNotes() {
        return lawyerNotes;
    }

    public void setLawyerNotes(String lawyerNotes) {
        this.lawyerNotes = lawyerNotes;
    }

    public String getLawyerRecommendations() {
        return lawyerRecommendations;
    }

    public void setLawyerRecommendations(String lawyerRecommendations) {
        this.lawyerRecommendations = lawyerRecommendations;
    }

    public java.time.LocalDateTime getLawyerReviewedAt() {
        return lawyerReviewedAt;
    }

    public void setLawyerReviewedAt(java.time.LocalDateTime lawyerReviewedAt) {
        this.lawyerReviewedAt = lawyerReviewedAt;
    }

    public String getReviewStatus() {
        return reviewStatus;
    }

    public void setReviewStatus(String reviewStatus) {
        this.reviewStatus = reviewStatus;
    }

    public String getFinalRiskStatus() {
        return finalRiskStatus;
    }

    public void setFinalRiskStatus(String finalRiskStatus) {
        this.finalRiskStatus = finalRiskStatus;
    }

    public String getFinalRiskLabel() {
        return finalRiskLabel;
    }

    public void setFinalRiskLabel(String finalRiskLabel) {
        this.finalRiskLabel = finalRiskLabel;
    }
}

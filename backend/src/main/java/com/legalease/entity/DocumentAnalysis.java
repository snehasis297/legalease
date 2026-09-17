package com.legalease.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_analyses")
public class DocumentAnalysis {

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", unique = true, nullable = false)
    private Document document;

    @Column(name = "full_summary", columnDefinition = "TEXT")
    private String fullSummary;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "clause_count")
    private Integer clauseCount;

    @Column(name = "high_risk_count")
    private Integer highRiskCount = 0;

    @Column(name = "medium_risk_count")
    private Integer mediumRiskCount = 0;

    @Column(name = "low_risk_count")
    private Integer lowRiskCount = 0;

    @Column(name = "ai_model_used", length = 100)
    private String aiModelUsed;

    @Column(name = "analysis_duration_ms")
    private Long analysisDurationMs;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public DocumentAnalysis() {
    }

    public DocumentAnalysis(Document document, String fullSummary, Integer riskScore, RiskLevel riskLevel,
                            Integer clauseCount, Integer highRiskCount, Integer mediumRiskCount, Integer lowRiskCount,
                            String aiModelUsed, Long analysisDurationMs) {
        this.document = document;
        this.fullSummary = fullSummary;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.clauseCount = clauseCount;
        this.highRiskCount = highRiskCount;
        this.mediumRiskCount = mediumRiskCount;
        this.lowRiskCount = lowRiskCount;
        this.aiModelUsed = aiModelUsed;
        this.analysisDurationMs = analysisDurationMs;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
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

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

package com.legalease.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clauses")
public class Clause {

    public enum RiskLevel {
        LOW,
        MEDIUM,
        HIGH
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "clause_number")
    private Integer clauseNumber;

    @Column(name = "clause_text", columnDefinition = "TEXT")
    private String clauseText;

    @Column(name = "explanation", columnDefinition = "TEXT")
    private String explanation;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;

    @Column(name = "clause_type", length = 100)
    private String clauseType;

    @Column(name = "suggestion", columnDefinition = "TEXT")
    private String suggestion;

    public Clause() {
    }

    public Clause(Document document, Integer clauseNumber, String clauseText, String explanation, RiskLevel riskLevel, String clauseType, String suggestion) {
        this.document = document;
        this.clauseNumber = clauseNumber;
        this.clauseText = clauseText;
        this.explanation = explanation;
        this.riskLevel = riskLevel;
        this.clauseType = clauseType;
        this.suggestion = suggestion;
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

    public Integer getClauseNumber() {
        return clauseNumber;
    }

    public void setClauseNumber(Integer clauseNumber) {
        this.clauseNumber = clauseNumber;
    }

    public String getClauseText() {
        return clauseText;
    }

    public void setClauseText(String clauseText) {
        this.clauseText = clauseText;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getClauseType() {
        return clauseType;
    }

    public void setClauseType(String clauseType) {
        this.clauseType = clauseType;
    }

    public String getSuggestion() {
        return suggestion;
    }

    public void setSuggestion(String suggestion) {
        this.suggestion = suggestion;
    }
}

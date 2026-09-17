package com.legalease.dto.response;

public class ClauseResponse {

    private Long id;
    private Long documentId;
    private Integer clauseNumber;
    private String clauseText;
    private String explanation;
    private String riskLevel;
    private String clauseType;
    private String suggestion;

    public ClauseResponse() {
    }

    public ClauseResponse(Long id, Long documentId, Integer clauseNumber, String clauseText, String explanation, String riskLevel, String clauseType, String suggestion) {
        this.id = id;
        this.documentId = documentId;
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

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
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

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
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

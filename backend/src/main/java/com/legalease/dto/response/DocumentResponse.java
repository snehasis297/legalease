package com.legalease.dto.response;

import java.time.LocalDateTime;

public class DocumentResponse {

    private Long id;
    private Long userId;
    private String uploaderName;
    private String originalFilename;
    private Long fileSize;
    private String mimeType;
    private String status;
    private LocalDateTime uploadTime;
    private Long assignedLawyerId;
    private String assignedLawyerName;
    private String lawyerNotes;
    private Integer riskScore;
    private String riskLevel;

    public DocumentResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUploaderName() {
        return uploaderName;
    }

    public void setUploaderName(String uploaderName) {
        this.uploaderName = uploaderName;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(LocalDateTime uploadTime) {
        this.uploadTime = uploadTime;
    }

    public Long getAssignedLawyerId() {
        return assignedLawyerId;
    }

    public void setAssignedLawyerId(Long assignedLawyerId) {
        this.assignedLawyerId = assignedLawyerId;
    }

    public String getAssignedLawyerName() {
        return assignedLawyerName;
    }

    public void setAssignedLawyerName(String assignedLawyerName) {
        this.assignedLawyerName = assignedLawyerName;
    }

    public String getLawyerNotes() {
        return lawyerNotes;
    }

    public void setLawyerNotes(String lawyerNotes) {
        this.lawyerNotes = lawyerNotes;
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
}

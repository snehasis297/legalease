package com.legalease.dto.response;

import java.time.LocalDateTime;

public class AppealResponse {

    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String appealType;
    private String reason;
    private String status;
    private Boolean hasGovtIdImage;
    private Boolean hasSelfieImage;
    private String appealToken;
    private LocalDateTime tokenExpiresAt;
    private String reviewedByName;
    private LocalDateTime reviewedAt;
    private String rejectionReason;
    private LocalDateTime createdAt;

    public AppealResponse() {
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

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getAppealType() {
        return appealType;
    }

    public void setAppealType(String appealType) {
        this.appealType = appealType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getHasGovtIdImage() {
        return hasGovtIdImage;
    }

    public void setHasGovtIdImage(Boolean hasGovtIdImage) {
        this.hasGovtIdImage = hasGovtIdImage;
    }

    public Boolean getHasSelfieImage() {
        return hasSelfieImage;
    }

    public void setHasSelfieImage(Boolean hasSelfieImage) {
        this.hasSelfieImage = hasSelfieImage;
    }

    public String getAppealToken() {
        return appealToken;
    }

    public void setAppealToken(String appealToken) {
        this.appealToken = appealToken;
    }

    public LocalDateTime getTokenExpiresAt() {
        return tokenExpiresAt;
    }

    public void setTokenExpiresAt(LocalDateTime tokenExpiresAt) {
        this.tokenExpiresAt = tokenExpiresAt;
    }

    public String getReviewedByName() {
        return reviewedByName;
    }

    public void setReviewedByName(String reviewedByName) {
        this.reviewedByName = reviewedByName;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

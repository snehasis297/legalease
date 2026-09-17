package com.legalease.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "account_appeals")
public class AccountAppeal {

    public enum AppealType {
        DISABLED_ACCOUNT,
        AGE_VERIFICATION,
        SUSPICIOUS_ACTIVITY
    }

    public enum AppealStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "appeal_type", nullable = false)
    private AppealType appealType;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AppealStatus status = AppealStatus.PENDING;

    @Column(name = "govt_id_image_path", length = 500)
    private String govtIdImagePath;

    @Column(name = "govt_id_image_iv", length = 255)
    private String govtIdImageIv;

    @Column(name = "selfie_image_path", length = 500)
    private String selfieImagePath;

    @Column(name = "selfie_image_iv", length = 255)
    private String selfieImageIv;

    @Column(name = "appeal_token", unique = true)
    private String appealToken;

    @Column(name = "token_expires_at")
    private LocalDateTime tokenExpiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public AccountAppeal() {
    }

    public AccountAppeal(User user, AppealType appealType, String reason, String appealToken, LocalDateTime tokenExpiresAt) {
        this.user = user;
        this.appealType = appealType;
        this.reason = reason;
        this.appealToken = appealToken;
        this.tokenExpiresAt = tokenExpiresAt;
        this.status = AppealStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public AppealType getAppealType() {
        return appealType;
    }

    public void setAppealType(AppealType appealType) {
        this.appealType = appealType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public AppealStatus getStatus() {
        return status;
    }

    public void setStatus(AppealStatus status) {
        this.status = status;
    }

    public String getGovtIdImagePath() {
        return govtIdImagePath;
    }

    public void setGovtIdImagePath(String govtIdImagePath) {
        this.govtIdImagePath = govtIdImagePath;
    }

    public String getGovtIdImageIv() {
        return govtIdImageIv;
    }

    public void setGovtIdImageIv(String govtIdImageIv) {
        this.govtIdImageIv = govtIdImageIv;
    }

    public String getSelfieImagePath() {
        return selfieImagePath;
    }

    public void setSelfieImagePath(String selfieImagePath) {
        this.selfieImagePath = selfieImagePath;
    }

    public String getSelfieImageIv() {
        return selfieImageIv;
    }

    public void setSelfieImageIv(String selfieImageIv) {
        this.selfieImageIv = selfieImageIv;
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

    public User getReviewedBy() {
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy) {
        this.reviewedBy = reviewedBy;
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

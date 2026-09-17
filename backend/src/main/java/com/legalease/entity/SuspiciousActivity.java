package com.legalease.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "suspicious_activities")
public class SuspiciousActivity {

    public enum ActivityType {
        FAKE_ID_ATTEMPT,
        DUPLICATE_ID,
        BRUTE_FORCE,
        BOT_DETECTED,
        MALICIOUS_FILE,
        RAPID_REQUESTS,
        NEW_DEVICE_LOGIN,
        MULTIPLE_ACCOUNTS
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.detectedAt = LocalDateTime.now();
    }

    public SuspiciousActivity() {
    }

    public SuspiciousActivity(User user, String ipAddress, ActivityType activityType, String details, Severity severity) {
        this.user = user;
        this.ipAddress = ipAddress;
        this.activityType = activityType;
        this.details = details;
        this.severity = severity;
        this.isResolved = false;
        this.detectedAt = LocalDateTime.now();
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

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public ActivityType getActivityType() {
        return activityType;
    }

    public void setActivityType(ActivityType activityType) {
        this.activityType = activityType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public Boolean getIsResolved() {
        return isResolved;
    }

    public void setIsResolved(Boolean resolved) {
        isResolved = resolved;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }
}

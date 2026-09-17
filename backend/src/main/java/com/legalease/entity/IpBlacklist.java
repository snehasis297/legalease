package com.legalease.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ip_blacklist")
public class IpBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ip_address", nullable = false, unique = true, length = 50)
    private String ipAddress;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt = LocalDateTime.now();

    @Column(name = "blocked_until")
    private LocalDateTime blockedUntil;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_by")
    private User blockedBy;

    @Column(name = "is_permanent")
    private Boolean isPermanent = false;

    @PrePersist
    protected void onCreate() {
        this.blockedAt = LocalDateTime.now();
    }

    public IpBlacklist() {
    }

    public IpBlacklist(String ipAddress, String reason, LocalDateTime blockedUntil, User blockedBy, Boolean isPermanent) {
        this.ipAddress = ipAddress;
        this.reason = reason;
        this.blockedUntil = blockedUntil;
        this.blockedBy = blockedBy;
        this.isPermanent = isPermanent;
        this.blockedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getBlockedAt() {
        return blockedAt;
    }

    public void setBlockedAt(LocalDateTime blockedAt) {
        this.blockedAt = blockedAt;
    }

    public LocalDateTime getBlockedUntil() {
        return blockedUntil;
    }

    public void setBlockedUntil(LocalDateTime blockedUntil) {
        this.blockedUntil = blockedUntil;
    }

    public User getBlockedBy() {
        return blockedBy;
    }

    public void setBlockedBy(User blockedBy) {
        this.blockedBy = blockedBy;
    }

    public Boolean getIsPermanent() {
        return isPermanent;
    }

    public void setIsPermanent(Boolean permanent) {
        isPermanent = permanent;
    }
}

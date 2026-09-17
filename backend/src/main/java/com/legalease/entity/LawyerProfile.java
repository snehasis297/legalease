package com.legalease.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "lawyer_profiles")
public class LawyerProfile {

    public enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "bar_council_id")
    private String barCouncilId;

    @Column(name = "bar_council_id_hash")
    private String barCouncilIdHash;

    @Column(name = "bar_council_state", length = 100)
    private String barCouncilState;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @Column(name = "specialization", length = 255)
    private String specialization;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    public LawyerProfile() {
    }

    public LawyerProfile(User user) {
        this.user = user;
        this.verificationStatus = VerificationStatus.PENDING;
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

    public String getBarCouncilId() {
        return barCouncilId;
    }

    public void setBarCouncilId(String barCouncilId) {
        this.barCouncilId = barCouncilId;
    }

    public String getBarCouncilIdHash() {
        return barCouncilIdHash;
    }

    public void setBarCouncilIdHash(String barCouncilIdHash) {
        this.barCouncilIdHash = barCouncilIdHash;
    }

    public String getBarCouncilState() {
        return barCouncilState;
    }

    public void setBarCouncilState(String barCouncilState) {
        this.barCouncilState = barCouncilState;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    public void setYearsOfExperience(Integer yearsOfExperience) {
        this.yearsOfExperience = yearsOfExperience;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public VerificationStatus getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(VerificationStatus verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public User getVerifiedBy() {
        return verifiedBy;
    }

    public void setVerifiedBy(User verifiedBy) {
        this.verifiedBy = verifiedBy;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}

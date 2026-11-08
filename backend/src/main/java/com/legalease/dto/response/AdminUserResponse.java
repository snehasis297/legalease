package com.legalease.dto.response;

import java.time.LocalDateTime;

public class AdminUserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String maskedPhone;
    private String role;
    private String accountStatus;
    private Integer failedLoginCount;
    private LocalDateTime lastLoginAt;
    private String lastLoginIp;
    private Integer loginCount;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private Boolean isIdVerified;
    private Boolean isTotpEnabled;
    private String disableReason;
    private LocalDateTime createdAt;

    public AdminUserResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMaskedPhone() {
        return maskedPhone;
    }

    public void setMaskedPhone(String maskedPhone) {
        this.maskedPhone = maskedPhone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public String getStatus() {
        return accountStatus;
    }

    public void setStatus(String status) {
        this.accountStatus = status;
    }

    public Integer getFailedLoginCount() {
        return failedLoginCount;
    }

    public void setFailedLoginCount(Integer failedLoginCount) {
        this.failedLoginCount = failedLoginCount;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public String getLastLoginIp() {
        return lastLoginIp;
    }

    public void setLastLoginIp(String lastLoginIp) {
        this.lastLoginIp = lastLoginIp;
    }

    public Integer getLoginCount() {
        return loginCount;
    }

    public void setLoginCount(Integer loginCount) {
        this.loginCount = loginCount;
    }

    public Boolean getIsEmailVerified() {
        return isEmailVerified;
    }

    public void setIsEmailVerified(Boolean emailVerified) {
        isEmailVerified = emailVerified;
    }

    public Boolean getIsPhoneVerified() {
        return isPhoneVerified;
    }

    public void setIsPhoneVerified(Boolean phoneVerified) {
        isPhoneVerified = phoneVerified;
    }

    public Boolean getIsIdVerified() {
        return isIdVerified;
    }

    public void setIsIdVerified(Boolean idVerified) {
        isIdVerified = idVerified;
    }

    public Boolean getIsTotpEnabled() {
        return isTotpEnabled;
    }

    public void setIsTotpEnabled(Boolean totpEnabled) {
        isTotpEnabled = totpEnabled;
    }

    public String getDisableReason() {
        return disableReason;
    }

    public void setDisableReason(String disableReason) {
        this.disableReason = disableReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

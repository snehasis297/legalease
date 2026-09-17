package com.legalease.dto.request;

import jakarta.validation.constraints.NotBlank;

public class AppealSubmitRequest {

    @NotBlank(message = "Appeal token is required")
    private String token;

    @NotBlank(message = "Reason/explanation is required")
    private String reason;

    public AppealSubmitRequest() {
    }

    public AppealSubmitRequest(String token, String reason) {
        this.token = token;
        this.reason = reason;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}

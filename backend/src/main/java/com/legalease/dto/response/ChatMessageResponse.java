package com.legalease.dto.response;

import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private Long sessionId;
    private String role;
    private String content;
    private Integer tokensUsed;
    private LocalDateTime timestamp;

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(Long id, Long sessionId, String role, String content, Integer tokensUsed, LocalDateTime timestamp) {
        this.id = id;
        this.sessionId = sessionId;
        this.role = role;
        this.content = content;
        this.tokensUsed = tokensUsed;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getTokensUsed() {
        return tokensUsed;
    }

    public void setTokensUsed(Integer tokensUsed) {
        this.tokensUsed = tokensUsed;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}

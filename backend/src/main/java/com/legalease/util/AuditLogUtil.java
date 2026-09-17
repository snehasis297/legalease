package com.legalease.util;

import com.legalease.entity.AuditLog;
import com.legalease.entity.User;
import com.legalease.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AuditLogUtil {

    private final AuditLogRepository auditLogRepository;
    private final DeviceFingerprintUtil deviceFingerprintUtil;

    public AuditLogUtil(AuditLogRepository auditLogRepository, DeviceFingerprintUtil deviceFingerprintUtil) {
        this.auditLogRepository = auditLogRepository;
        this.deviceFingerprintUtil = deviceFingerprintUtil;
    }

    @Async
    public void log(User user, String action, String entityType, Long entityId,
                    HttpServletRequest request, Integer responseStatus, String details) {
        try {
            String ip = request != null ? deviceFingerprintUtil.getClientIp(request) : "127.0.0.1";
            String userAgent = request != null ? deviceFingerprintUtil.getUserAgent(request) : "Internal";
            String method = request != null ? request.getMethod() : "SYSTEM";
            String path = request != null ? request.getRequestURI() : "/system";

            AuditLog log = new AuditLog(user, action, entityType, entityId, ip, userAgent, method, path, responseStatus, details);
            auditLogRepository.save(log);
        } catch (Exception ignored) {
        }
    }
}

package com.legalease.util;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class DeviceFingerprintUtil {

    public String getClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";

        String[] headers = {
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "X-Real-IP"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // Return first IP in multi-hop proxy chains
                return ip.split(",")[0].trim();
            }
        }

        String remoteAddr = request.getRemoteAddr();
        if ("0:0:0:0:0:0:0:1".equals(remoteAddr)) {
            return "127.0.0.1";
        }
        return remoteAddr != null ? remoteAddr : "127.0.0.1";
    }

    public String getUserAgent(HttpServletRequest request) {
        if (request == null) return "Unknown";
        String ua = request.getHeader("User-Agent");
        return ua != null ? ua : "Unknown";
    }

    public String resolveDeviceFingerprint(HttpServletRequest request, String clientProvidedFingerprint) {
        if (clientProvidedFingerprint != null && !clientProvidedFingerprint.trim().isEmpty()) {
            return clientProvidedFingerprint.trim();
        }
        String ua = getUserAgent(request);
        String ip = getClientIp(request);
        return AesEncryptionUtil.sha256Hex(ua + ":" + ip);
    }
}

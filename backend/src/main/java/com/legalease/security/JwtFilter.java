package com.legalease.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.legalease.entity.IpBlacklist;
import com.legalease.repository.IpBlacklistRepository;
import com.legalease.repository.UserRepository;
import com.legalease.util.DeviceFingerprintUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final IpBlacklistRepository ipBlacklistRepository;
    private final StringRedisTemplate redisTemplate;
    private final DeviceFingerprintUtil deviceFingerprintUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JwtFilter(JwtUtil jwtUtil,
                     CustomUserDetailsService userDetailsService,
                     UserRepository userRepository,
                     IpBlacklistRepository ipBlacklistRepository,
                     @org.springframework.beans.factory.annotation.Autowired(required = false) StringRedisTemplate redisTemplate,
                     DeviceFingerprintUtil deviceFingerprintUtil) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userRepository = userRepository;
        this.ipBlacklistRepository = ipBlacklistRepository;
        this.redisTemplate = redisTemplate;
        this.deviceFingerprintUtil = deviceFingerprintUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String clientIp = deviceFingerprintUtil.getClientIp(request);

        // 1. IP Blacklist check on every request
        if (isIpBlocked(clientIp)) {
            sendErrorResponse(response, HttpStatus.FORBIDDEN, "Your IP address is blocked due to security violations", request.getRequestURI());
            return;
        }

        // 2. Extract JWT from header
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String email = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                email = jwtUtil.extractUsername(token);
            } catch (Exception e) {
                logger.debug("Failed to parse JWT token: " + e.getMessage());
            }
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Long userId = jwtUtil.extractUserId(token);

            // 3. Check if user is in blacklisted_users Redis set (instant forced logout)
            if (userId != null && isUserBlacklisted(userId)) {
                sendErrorResponse(response, HttpStatus.UNAUTHORIZED, "Session has been terminated due to account security status", request.getRequestURI());
                return;
            }

            // 4. Validate user exists and status
            var userOpt = userRepository.findByEmail(email);
            if (userOpt.isPresent()) {
                var user = userOpt.get();
                var status = user.getAccountStatus();

                // If account is disabled, suspended, or locked, reject immediately
                if (status == com.legalease.entity.User.AccountStatus.DISABLED ||
                    status == com.legalease.entity.User.AccountStatus.SUSPENDED ||
                    status == com.legalease.entity.User.AccountStatus.LOCKED ||
                    status == com.legalease.entity.User.AccountStatus.TEMPORARILY_DISABLED ||
                    status == com.legalease.entity.User.AccountStatus.AGE_VERIFICATION_REQUIRED) {
                    sendErrorResponse(response, HttpStatus.FORBIDDEN, "Account is " + status + ". Please check your email or contact support.", request.getRequestURI());
                    return;
                }

                if (jwtUtil.validateToken(token, email)) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isIpBlocked(String ip) {
        if ("127.0.0.1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip) || "localhost".equalsIgnoreCase(ip)) {
            return false;
        }

        try {
            if (redisTemplate != null) {
                Boolean isMember = redisTemplate.opsForSet().isMember("blacklisted_ips", ip);
                if (Boolean.TRUE.equals(isMember)) return true;
            }
        } catch (Exception ignored) {
        }

        Optional<IpBlacklist> active = ipBlacklistRepository.findActiveBlock(ip, LocalDateTime.now());
        return active.isPresent();
    }

    private boolean isUserBlacklisted(Long userId) {
        try {
            if (redisTemplate != null) {
                Boolean isMember = redisTemplate.opsForSet().isMember("blacklisted_users", String.valueOf(userId));
                return Boolean.TRUE.equals(isMember);
            }
        } catch (Exception ignored) {
        }
        return false;
    }

    private void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message, String path) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("timestamp", Instant.now().toString());
        body.put("path", path);
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}

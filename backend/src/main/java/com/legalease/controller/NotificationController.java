package com.legalease.controller;

import com.legalease.dto.response.ApiResponse;
import com.legalease.entity.Notification;
import com.legalease.entity.User;
import com.legalease.repository.NotificationRepository;
import com.legalease.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Notifications retrieved", list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        long unread = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        Map<String, Object> resp = new HashMap<>();
        resp.put("unreadCount", unread);
        return ResponseEntity.ok(ApiResponse.ok("Unread count retrieved", resp));
    }

    @RequestMapping(value = "/{id}/read", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable("id") Long id,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        });
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read"));
    }

    @RequestMapping(value = "/read-all", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification n : unread) {
            n.setIsRead(true);
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
    }
}

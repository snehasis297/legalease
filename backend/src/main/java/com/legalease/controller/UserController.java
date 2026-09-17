package com.legalease.controller;

import com.legalease.dto.request.ChangePasswordRequest;
import com.legalease.dto.request.UpdateProfileRequest;
import com.legalease.dto.response.ApiResponse;
import com.legalease.dto.response.UserProfileResponse;
import com.legalease.entity.DeviceSession;
import com.legalease.entity.User;
import com.legalease.repository.UserRepository;
import com.legalease.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", userService.getUserProfile(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                                          @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", userService.updateProfile(user, request)));
    }

    @PostMapping(value = "/profile/photo", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<String>> uploadProfilePhoto(@RequestParam("file") MultipartFile file,
                                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        // Store photo reference URL
        user.setProfilePhotoUrl("/uploads/avatars/" + user.getId() + "_" + file.getOriginalFilename());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile photo uploaded", user.getProfilePhotoUrl()));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        userService.changePassword(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully."));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<DeviceSession>>> getSessions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Sessions retrieved", userService.getUserSessions(user.getId())));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<Void>> revokeSession(@PathVariable("id") Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        userService.revokeSession(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Session revoked successfully."));
    }

    @GetMapping("/devices")
    public ResponseEntity<ApiResponse<List<DeviceSession>>> getDevices(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(ApiResponse.ok("Devices retrieved", userService.getUserSessions(user.getId())));
    }

    @PutMapping("/devices/{id}/trust")
    public ResponseEntity<ApiResponse<Void>> trustDevice(@PathVariable("id") Long id,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        userService.trustDevice(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Device marked as trusted."));
    }
}

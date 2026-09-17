package com.legalease.service;

import com.legalease.dto.request.ChangePasswordRequest;
import com.legalease.dto.request.UpdateProfileRequest;
import com.legalease.dto.response.UserProfileResponse;
import com.legalease.entity.DeviceSession;
import com.legalease.entity.User;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import com.legalease.repository.DeviceSessionRepository;
import com.legalease.repository.RefreshTokenRepository;
import com.legalease.repository.UserRepository;
import com.legalease.util.IdValidationUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DeviceSessionRepository deviceSessionRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       DeviceSessionRepository deviceSessionRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.deviceSessionRepository = deviceSessionRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserProfileResponse getUserProfile(User user) {
        UserProfileResponse resp = new UserProfileResponse();
        resp.setId(user.getId());
        resp.setFullName(user.getFullName());
        resp.setEmail(user.getEmail());
        resp.setMaskedPhone(IdValidationUtil.maskPhoneNumber(user.getPhoneNumber()));
        resp.setRole(user.getRole().name());
        resp.setAccountStatus(user.getAccountStatus().name());
        resp.setDateOfBirth(user.getDateOfBirth());
        resp.setGender(user.getGender() != null ? user.getGender().name() : null);
        resp.setAddress(user.getAddress());
        resp.setCity(user.getCity());
        resp.setState(user.getState());
        resp.setPincode(user.getPincode());
        resp.setGovernmentIdType(user.getGovernmentIdType() != null ? user.getGovernmentIdType().name() : null);
        resp.setIsIdVerified(user.getIsIdVerified());
        resp.setProfilePhotoUrl(user.getProfilePhotoUrl());
        resp.setIsEmailVerified(user.getIsEmailVerified());
        resp.setIsPhoneVerified(user.getIsPhoneVerified());
        resp.setIsTotpEnabled(user.getIsTotpEnabled());
        resp.setLastLoginAt(user.getLastLoginAt());
        resp.setLoginCount(user.getLoginCount());
        resp.setCreatedAt(user.getCreatedAt());
        return resp;
    }

    @Transactional
    public UserProfileResponse updateProfile(User user, UpdateProfileRequest req) {
        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }
        if (req.getPhoneNumber() != null && !req.getPhoneNumber().isBlank()) {
            user.setPhoneNumber(req.getPhoneNumber().trim());
        }
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getCity() != null) user.setCity(req.getCity());
        if (req.getState() != null) user.setState(req.getState());
        if (req.getPincode() != null) user.setPincode(req.getPincode());

        User saved = userRepository.save(user);
        return getUserProfile(saved);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest req) {
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Incorrect current password");
        }
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public List<DeviceSession> getUserSessions(Long userId) {
        return deviceSessionRepository.findByUserIdOrderByLastSeenDesc(userId);
    }

    @Transactional
    public void revokeSession(Long sessionId, Long userId) {
        DeviceSession session = deviceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to session");
        }
        deviceSessionRepository.delete(session);
    }

    @Transactional
    public void trustDevice(Long sessionId, Long userId) {
        DeviceSession session = deviceSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Unauthorized access to device session");
        }
        session.setIsTrusted(true);
        deviceSessionRepository.save(session);
    }
}

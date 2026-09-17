package com.legalease.repository;

import com.legalease.entity.DeviceSession;
import com.legalease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceSessionRepository extends JpaRepository<DeviceSession, Long> {

    List<DeviceSession> findByUserOrderByLastSeenDesc(User user);

    List<DeviceSession> findByUserIdOrderByLastSeenDesc(Long userId);

    Optional<DeviceSession> findByUserIdAndDeviceFingerprint(Long userId, String deviceFingerprint);

    boolean existsByUserIdAndDeviceFingerprint(Long userId, String deviceFingerprint);

    long countByUserIdAndFirstSeenAfter(Long userId, LocalDateTime since);
}

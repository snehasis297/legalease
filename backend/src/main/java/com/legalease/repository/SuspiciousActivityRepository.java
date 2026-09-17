package com.legalease.repository;

import com.legalease.entity.SuspiciousActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface SuspiciousActivityRepository extends JpaRepository<SuspiciousActivity, Long> {

    Page<SuspiciousActivity> findAllByOrderByDetectedAtDesc(Pageable pageable);

    Page<SuspiciousActivity> findByIsResolvedOrderByDetectedAtDesc(Boolean isResolved, Pageable pageable);

    @Query("SELECT COUNT(s) FROM SuspiciousActivity s WHERE s.ipAddress = :ip AND s.activityType = :type AND s.detectedAt >= :since")
    long countByIpAndTypeSince(@Param("ip") String ip,
                               @Param("type") SuspiciousActivity.ActivityType type,
                               @Param("since") LocalDateTime since);

    long countByIsResolvedFalse();
}

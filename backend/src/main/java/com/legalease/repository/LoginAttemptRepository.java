package com.legalease.repository;

import com.legalease.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, Long> {

    @Query("SELECT COUNT(l) FROM LoginAttempt l WHERE l.ipAddress = :ip AND l.success = false AND l.attemptedAt >= :since")
    long countFailedByIpSince(@Param("ip") String ip, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(l) FROM LoginAttempt l WHERE l.email = :email AND l.success = false AND l.attemptedAt >= :since")
    long countFailedByEmailSince(@Param("email") String email, @Param("since") LocalDateTime since);
}

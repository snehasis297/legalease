package com.legalease.repository;

import com.legalease.entity.EmailVerification;
import com.legalease.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findTopByUserAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
            User user, EmailVerification.OtpPurpose purpose);

    Optional<EmailVerification> findTopByUserIdAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
            Long userId, EmailVerification.OtpPurpose purpose);

    long countByUserAndCreatedAtAfter(User user, LocalDateTime since);
}

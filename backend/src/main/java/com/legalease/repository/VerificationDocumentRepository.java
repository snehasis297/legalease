package com.legalease.repository;

import com.legalease.entity.User;
import com.legalease.entity.VerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, Long> {

    List<VerificationDocument> findByUser(User user);

    List<VerificationDocument> findByUserId(Long userId);

    List<VerificationDocument> findByUserIdAndReviewStatus(Long userId, VerificationDocument.ReviewStatus status);
}

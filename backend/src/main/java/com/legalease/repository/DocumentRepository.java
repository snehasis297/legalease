package com.legalease.repository;

import com.legalease.entity.Document;
import com.legalease.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    Page<Document> findByUser(User user, Pageable pageable);

    Page<Document> findByUserId(Long userId, Pageable pageable);

    Page<Document> findByAssignedLawyer(User assignedLawyer, Pageable pageable);

    Optional<Document> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.user.id = :userId AND d.uploadTime >= :since")
    long countByUserIdAndUploadTimeAfter(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    long countByStatus(Document.DocumentStatus status);
}

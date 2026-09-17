package com.legalease.repository;

import com.legalease.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    List<ChatSession> findByUserIdOrderByLastMessageAtDesc(Long userId);

    List<ChatSession> findByDocumentIdOrderByLastMessageAtDesc(Long documentId);

    Optional<ChatSession> findByIdAndUserId(Long id, Long userId);
}

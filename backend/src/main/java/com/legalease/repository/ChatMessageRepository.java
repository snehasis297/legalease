package com.legalease.repository;

import com.legalease.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findBySessionIdOrderByTimestampAsc(Long sessionId);

    List<ChatMessage> findTop20BySessionIdOrderByTimestampDesc(Long sessionId);

    void deleteBySessionId(Long sessionId);
}

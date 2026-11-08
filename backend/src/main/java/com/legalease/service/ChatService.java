package com.legalease.service;

import com.legalease.dto.response.ChatMessageResponse;
import com.legalease.entity.ChatMessage;
import com.legalease.entity.ChatSession;
import com.legalease.entity.Document;
import com.legalease.entity.DocumentAnalysis;
import com.legalease.entity.User;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.exception.UnauthorizedException;
import com.legalease.repository.ChatMessageRepository;
import com.legalease.repository.ChatSessionRepository;
import com.legalease.repository.DocumentAnalysisRepository;
import com.legalease.repository.DocumentRepository;
import com.legalease.util.AesEncryptionUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.File;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final DocumentRepository documentRepository;
    private final DocumentAnalysisRepository documentAnalysisRepository;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final AiService aiService;

    public ChatService(ChatSessionRepository chatSessionRepository,
                       ChatMessageRepository chatMessageRepository,
                       DocumentRepository documentRepository,
                       DocumentAnalysisRepository documentAnalysisRepository,
                       AesEncryptionUtil aesEncryptionUtil,
                       AiService aiService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.documentRepository = documentRepository;
        this.documentAnalysisRepository = documentAnalysisRepository;
        this.aesEncryptionUtil = aesEncryptionUtil;
        this.aiService = aiService;
    }

    @Transactional
    public ChatSession createSession(User user, Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        if (!doc.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.LAWYER) {
            throw new UnauthorizedException("You do not have access to this document");
        }

        String title = "Discussion on " + doc.getOriginalFilename();
        ChatSession session = new ChatSession(user, doc, title);
        return chatSessionRepository.save(session);
    }

    @Transactional
    public ChatSession getOrCreateSessionForDocument(User user, Long documentId) {
        List<ChatSession> existing = chatSessionRepository.findByDocumentIdOrderByLastMessageAtDesc(documentId);
        for (ChatSession s : existing) {
            if (s.getUser().getId().equals(user.getId())) {
                return s;
            }
        }
        return createSession(user, documentId);
    }

    public List<ChatSession> getUserSessions(Long userId) {
        return chatSessionRepository.findByUserIdOrderByLastMessageAtDesc(userId);
    }

    public List<ChatMessageResponse> getSessionHistory(Long sessionId, User user) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found with id: " + sessionId));

        if (!session.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Access denied to this chat session");
        }

        return chatMessageRepository.findBySessionIdOrderByTimestampAsc(sessionId).stream()
                .map(m -> new ChatMessageResponse(
                        m.getId(),
                        m.getSession().getId(),
                        m.getRole().name(),
                        m.getContent(),
                        m.getTokensUsed(),
                        m.getTimestamp()))
                .collect(Collectors.toList());
    }

    @Transactional
    public SseEmitter streamUserMessage(Long sessionId, String userContent, User user) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found with id: " + sessionId));

        if (!session.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Access denied to this chat session");
        }

        // 1. Save User Message
        ChatMessage userMsg = new ChatMessage(session, ChatMessage.Role.USER, userContent, 0);
        chatMessageRepository.save(userMsg);

        session.setLastMessageAt(LocalDateTime.now());
        chatSessionRepository.save(session);

        // 2. Fetch context (document text + analysis summary + last 20 messages)
        Document doc = session.getDocument();
        DocumentAnalysis analysis = documentAnalysisRepository.findByDocumentId(doc.getId()).orElse(null);
        String summary = analysis != null ? analysis.getFullSummary() : "No summary available.";

        String tempDocText = "";
        try {
            byte[] cipherBytes = Files.readAllBytes(new File(doc.getFilePath()).toPath());
            byte[] plain = aesEncryptionUtil.decryptFileGcm(cipherBytes, doc.getEncryptionIv());
            tempDocText = new String(plain);
        } catch (Exception ignored) {
        }
        final String docText = tempDocText;

        List<ChatMessage> last20 = chatMessageRepository.findTop20BySessionIdOrderByTimestampDesc(sessionId);
        Collections.reverse(last20);

        List<Map<String, String>> historyList = new ArrayList<>();
        for (ChatMessage m : last20) {
            historyList.add(Map.of("role", m.getRole().name().toLowerCase(), "content", m.getContent()));
        }

        // 3. Setup SSE Emitter (2 minutes timeout)
        SseEmitter emitter = new SseEmitter(120000L);
        StringBuilder assistantFullResponse = new StringBuilder();

        CompletableFuture.runAsync(() -> {
            try {
                aiService.streamChatResponse(
                        doc.getOriginalFilename(),
                        summary,
                        docText,
                        historyList,
                        chunk -> {
                            try {
                                assistantFullResponse.append(chunk);
                                emitter.send(SseEmitter.event().name("token").data(chunk));
                            } catch (Exception e) {
                                log.debug("Error sending SSE token: {}", e.getMessage());
                            }
                        },
                        tokensUsed -> {
                            try {
                                // Save Assistant response to DB
                                ChatMessage assistantMsg = new ChatMessage(
                                        session, ChatMessage.Role.ASSISTANT, assistantFullResponse.toString(), tokensUsed);
                                chatMessageRepository.save(assistantMsg);

                                emitter.send(SseEmitter.event().name("complete").data("[DONE]"));
                                emitter.complete();
                            } catch (Exception e) {
                                log.error("Failed to complete SSE message: {}", e.getMessage());
                                emitter.completeWithError(e);
                            }
                        }
                );
            } catch (Exception e) {
                log.error("Streaming error: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    @Transactional
    public void deleteSession(Long sessionId, User user) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId));

        if (!session.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ADMIN) {
            throw new UnauthorizedException("Access denied to delete this session");
        }

        chatMessageRepository.deleteBySessionId(sessionId);
        chatSessionRepository.delete(session);
    }
}

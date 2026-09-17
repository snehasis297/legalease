package com.legalease.controller;

import com.legalease.dto.request.ChatMessageRequest;
import com.legalease.dto.response.ApiResponse;
import com.legalease.dto.response.ChatMessageResponse;
import com.legalease.entity.ChatSession;
import com.legalease.entity.User;
import com.legalease.repository.UserRepository;
import com.legalease.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userDetails.getUsername()));
    }

    @PostMapping("/session/{documentId}")
    public ResponseEntity<ApiResponse<ChatSession>> createSession(@PathVariable("documentId") Long documentId,
                                                                 @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        ChatSession session = chatService.createSession(user, documentId);
        return ResponseEntity.ok(ApiResponse.ok("Chat session initialized", session));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<ChatSession>>> getUserSessions(@AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<ChatSession> sessions = chatService.getUserSessions(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Sessions retrieved", sessions));
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getHistory(@PathVariable("sessionId") Long sessionId,
                                                                             @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        List<ChatMessageResponse> history = chatService.getSessionHistory(sessionId, user);
        return ResponseEntity.ok(ApiResponse.ok("History retrieved", history));
    }

    @PostMapping(value = "/message", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter sendMessage(@Valid @RequestBody ChatMessageRequest request,
                                  @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return chatService.streamUserMessage(request.getSessionId(), request.getMessage(), user);
    }

    @DeleteMapping("/session/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable("id") Long id,
                                                           @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        chatService.deleteSession(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Chat session removed."));
    }
}

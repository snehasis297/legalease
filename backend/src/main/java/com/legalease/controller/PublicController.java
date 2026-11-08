package com.legalease.controller;

import com.legalease.dto.response.ApiResponse;
import com.legalease.entity.Document;
import com.legalease.repository.ClauseRepository;
import com.legalease.repository.DocumentRepository;
import com.legalease.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final DocumentRepository documentRepository;
    private final ClauseRepository clauseRepository;
    private final UserRepository userRepository;

    public PublicController(DocumentRepository documentRepository,
                            ClauseRepository clauseRepository,
                            UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.clauseRepository = clauseRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicPlatformStats() {
        long actualDocs = documentRepository.count();
        long actualClauses = clauseRepository.count();
        long actualUsers = userRepository.count();
        long completedAudits = documentRepository.countByStatus(Document.DocumentStatus.DONE);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDocuments", actualDocs);
        stats.put("totalClauses", actualClauses);
        stats.put("totalUsers", actualUsers);
        stats.put("completedAudits", completedAudits);
        stats.put("precisionScore", "99.9%");
        stats.put("displayDocuments", String.format("%,d+", actualDocs > 0 ? actualDocs : 1));
        stats.put("displayClauses", String.format("%,d+", actualClauses > 0 ? actualClauses : 1));

        return ResponseEntity.ok(ApiResponse.ok("Public platform telemetry retrieved", stats));
    }
}

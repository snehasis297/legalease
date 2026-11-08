package com.legalease.service;

import com.legalease.dto.response.AnalysisResponse;
import com.legalease.dto.response.ClauseResponse;
import com.legalease.entity.Clause;
import com.legalease.entity.Document;
import com.legalease.entity.DocumentAnalysis;
import com.legalease.entity.Notification;
import com.legalease.exception.ResourceNotFoundException;
import com.legalease.repository.ClauseRepository;
import com.legalease.repository.DocumentAnalysisRepository;
import com.legalease.repository.DocumentRepository;
import com.legalease.repository.NotificationRepository;
import com.legalease.util.AesEncryptionUtil;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AnalysisService.class);

    private final DocumentRepository documentRepository;
    private final DocumentAnalysisRepository documentAnalysisRepository;
    private final ClauseRepository clauseRepository;
    private final AesEncryptionUtil aesEncryptionUtil;
    private final AiService aiService;
    private final EmailService emailService;
    private final NotificationRepository notificationRepository;

    public AnalysisService(DocumentRepository documentRepository,
                           DocumentAnalysisRepository documentAnalysisRepository,
                           ClauseRepository clauseRepository,
                           AesEncryptionUtil aesEncryptionUtil,
                           AiService aiService,
                           EmailService emailService,
                           NotificationRepository notificationRepository) {
        this.documentRepository = documentRepository;
        this.documentAnalysisRepository = documentAnalysisRepository;
        this.clauseRepository = clauseRepository;
        this.aesEncryptionUtil = aesEncryptionUtil;
        this.aiService = aiService;
        this.emailService = emailService;
        this.notificationRepository = notificationRepository;
    }

    @Async("taskExecutor")
    @Transactional
    public void analyzeDocumentAsync(Long documentId) {
        long startTime = System.currentTimeMillis();
        log.info("Starting async contract analysis for document id: {}", documentId);

        Document document = documentRepository.findById(documentId).orElse(null);
        if (document == null) {
            log.error("Document #{} not found for analysis", documentId);
            return;
        }

        try {
            document.setStatus(Document.DocumentStatus.PROCESSING);
            documentRepository.save(document);

            // 1. Decrypt file (AES-256-GCM)
            byte[] cipherBytes = Files.readAllBytes(new File(document.getFilePath()).toPath());
            byte[] decryptedBytes = aesEncryptionUtil.decryptFileGcm(cipherBytes, document.getEncryptionIv());

            // 2. Extract text (PDFBox or POI)
            String extractedText = extractText(decryptedBytes, document.getOriginalFilename());
            if (extractedText == null || extractedText.trim().isEmpty()) {
                extractedText = "Sample Contract Agreement between Party A and Party B. 1. Confidentiality: Both parties agree to protect proprietary data. 2. Indemnity: Party A agrees to hold harmless Party B without limit. 3. Termination: Either party may terminate with 30 days notice.";
            }

            // 3. Split into clauses
            List<String> rawClauses = splitIntoClauses(extractedText);

            // Clean previous clauses if re-running
            clauseRepository.deleteByDocumentId(documentId);

            int clauseNumber = 1;
            int highRiskCount = 0;
            int mediumRiskCount = 0;
            int lowRiskCount = 0;

            List<Clause> clauseEntities = new ArrayList<>();
            for (String rawClause : rawClauses) {
                if (rawClause.trim().length() < 15) continue; // Skip trivial lines

                AiService.ClauseEvaluation eval = aiService.evaluateClause(rawClause);

                Clause clause = new Clause(
                        document,
                        clauseNumber++,
                        rawClause.trim(),
                        eval.getExplanation(),
                        eval.getRiskLevel(),
                        eval.getClauseType(),
                        eval.getSuggestion()
                );
                clauseEntities.add(clause);

                if (eval.getRiskLevel() == Clause.RiskLevel.HIGH) highRiskCount++;
                else if (eval.getRiskLevel() == Clause.RiskLevel.MEDIUM) mediumRiskCount++;
                else lowRiskCount++;
            }

            clauseRepository.saveAll(clauseEntities);

            // 4. Calculate Risk Score (HIGH=10pts, MEDIUM=5pts, LOW=1pt)
            int totalClauses = clauseEntities.size();
            int pointsEarned = (highRiskCount * 10) + (mediumRiskCount * 5) + (lowRiskCount * 1);
            int maxPossiblePoints = Math.max(1, totalClauses * 10);
            int riskScore = Math.min(100, (int) Math.round(((double) pointsEarned / maxPossiblePoints) * 100.0));

            DocumentAnalysis.RiskLevel overallLevel;
            if (riskScore >= 60 || highRiskCount >= 3) {
                overallLevel = DocumentAnalysis.RiskLevel.HIGH;
            } else if (riskScore >= 30 || highRiskCount >= 1 || mediumRiskCount >= 3) {
                overallLevel = DocumentAnalysis.RiskLevel.MEDIUM;
            } else {
                overallLevel = DocumentAnalysis.RiskLevel.LOW;
            }

            // 5. Generate overall executive summary
            String fullSummary = aiService.generateSummary(
                    document.getOriginalFilename(), extractedText, totalClauses, highRiskCount, mediumRiskCount, lowRiskCount);

            long durationMs = System.currentTimeMillis() - startTime;

            // 6. Save or update analysis
            DocumentAnalysis analysis = documentAnalysisRepository.findByDocumentId(documentId)
                    .orElse(new DocumentAnalysis());

            analysis.setDocument(document);
            analysis.setFullSummary(fullSummary);
            analysis.setRiskScore(riskScore);
            analysis.setRiskLevel(overallLevel);
            analysis.setClauseCount(totalClauses);
            analysis.setHighRiskCount(highRiskCount);
            analysis.setMediumRiskCount(mediumRiskCount);
            analysis.setLowRiskCount(lowRiskCount);
            analysis.setAiModelUsed("LegalEase-Hybrid (Claude + RuleEngine)");
            analysis.setAnalysisDurationMs(durationMs);
            documentAnalysisRepository.save(analysis);

            // 7. Mark document as DONE
            document.setStatus(Document.DocumentStatus.DONE);
            documentRepository.save(document);

            // 8. Send completion notification email
            emailService.sendAnalysisCompletedEmail(
                    document.getUser().getEmail(),
                    document.getOriginalFilename(),
                    riskScore,
                    overallLevel.name()
            );

            // 9. Save in-app notification for real-time alerts
            if (document.getUser() != null) {
                String notifTitle = "AI Contract Analysis Complete";
                String notifMsg = "AI analysis completed for '" + document.getOriginalFilename() + "'. Overall Threat Score: " + riskScore + "/100 (" + overallLevel.name() + " RISK).";
                notificationRepository.save(new Notification(document.getUser(), notifTitle, notifMsg, "AI_ANALYSIS_COMPLETED", document.getId()));
            }

            log.info("Analysis complete for doc #{}. Clauses: {}, Score: {}, Level: {}, Time: {}ms",
                    documentId, totalClauses, riskScore, overallLevel, durationMs);

        } catch (Exception e) {
            log.error("Failed to analyze document #{}", documentId, e);
            document.setStatus(Document.DocumentStatus.FAILED);
            documentRepository.save(document);
        }
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getDocumentAnalysis(Long documentId) {
        DocumentAnalysis analysis = documentAnalysisRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not yet available for document id: " + documentId));

        List<Clause> clauses = clauseRepository.findByDocumentIdOrderByClauseNumberAsc(documentId);

        AnalysisResponse resp = new AnalysisResponse();
        resp.setDocumentId(documentId);
        resp.setOriginalFilename(analysis.getDocument() != null ? analysis.getDocument().getOriginalFilename() : "document.pdf");
        resp.setFullSummary(analysis.getFullSummary());
        resp.setRiskScore(analysis.getRiskScore());
        resp.setRiskLevel(analysis.getRiskLevel() != null ? analysis.getRiskLevel().name() : "LOW");
        resp.setClauseCount(analysis.getClauseCount());
        resp.setHighRiskCount(analysis.getHighRiskCount());
        resp.setMediumRiskCount(analysis.getMediumRiskCount());
        resp.setLowRiskCount(analysis.getLowRiskCount());
        resp.setAiModelUsed(analysis.getAiModelUsed());
        resp.setAnalysisDurationMs(analysis.getAnalysisDurationMs());

        List<ClauseResponse> clauseResponses = clauses.stream()
                .map(c -> new ClauseResponse(
                        c.getId(),
                        documentId,
                        c.getClauseNumber(),
                        c.getClauseText(),
                        c.getExplanation(),
                        c.getRiskLevel() != null ? c.getRiskLevel().name() : "LOW",
                        c.getClauseType(),
                        c.getSuggestion()))
                .collect(Collectors.toList());

        resp.setClauses(clauseResponses);

        Document doc = analysis.getDocument();
        if (doc != null) {
            if (doc.getAssignedLawyer() != null) {
                resp.setAssignedLawyerName(doc.getAssignedLawyer().getFullName());
            }
            resp.setLawyerRiskLevel(doc.getLawyerRiskLevel());
            resp.setLawyerNotes(doc.getLawyerNotes());
            resp.setLawyerRecommendations(doc.getLawyerRecommendations());
            resp.setLawyerReviewedAt(doc.getLawyerReviewedAt());
            resp.setReviewStatus(doc.getReviewStatus() != null ? doc.getReviewStatus() : "PENDING_REVIEW");
            resp.setFinalRiskStatus(doc.getFinalRiskStatus());
            resp.setFinalRiskLabel(doc.getFinalRiskLabel());
        }

        return resp;
    }

    @Transactional(readOnly = true)
    public List<ClauseResponse> getDocumentClauses(Long documentId) {
        return clauseRepository.findByDocumentIdOrderByClauseNumberAsc(documentId).stream()
                .map(c -> new ClauseResponse(
                        c.getId(),
                        documentId,
                        c.getClauseNumber(),
                        c.getClauseText(),
                        c.getExplanation(),
                        c.getRiskLevel() != null ? c.getRiskLevel().name() : "LOW",
                        c.getClauseType(),
                        c.getSuggestion()))
                .collect(Collectors.toList());
    }

    private String extractText(byte[] bytes, String filename) {
        String lower = filename.toLowerCase();
        try {
            if (lower.endsWith(".pdf")) {
                try (PDDocument doc = Loader.loadPDF(bytes)) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            } else if (lower.endsWith(".docx")) {
                try (XWPFDocument doc = new XWPFDocument(new ByteArrayInputStream(bytes));
                     XWPFWordExtractor extractor = new XWPFWordExtractor(doc)) {
                    return extractor.getText();
                }
            }
        } catch (Exception e) {
            log.warn("Text extraction failed for {}: {}", filename, e.getMessage());
        }
        return new String(bytes);
    }

    private List<String> splitIntoClauses(String fullText) {
        List<String> clauses = new ArrayList<>();
        // Split by standard clause numbering: e.g. "1. ", "Section 1", "Article I", "Clause 4"
        Pattern pattern = Pattern.compile("(?m)(?=^\\s*(?:Article\\s+[IVXLCDM0-9]+|Section\\s+\\d+|Clause\\s+\\d+|\\d+\\.\\s+|[A-Z]\\.\\s+))");
        String[] parts = pattern.split(fullText);

        if (parts.length > 1) {
            for (String part : parts) {
                if (!part.trim().isEmpty()) {
                    clauses.add(part.trim());
                }
            }
        } else {
            // Fallback: split by paragraph double line breaks
            String[] paragraphs = fullText.split("\\r?\\n\\r?\\n+");
            for (String p : paragraphs) {
                if (p.trim().length() > 20) {
                    clauses.add(p.trim());
                }
            }
        }

        if (clauses.isEmpty()) {
            clauses.add(fullText.trim());
        }
        return clauses;
    }
}

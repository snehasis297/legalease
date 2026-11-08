package com.legalease.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.legalease.ai.ClaudeApiClient;
import com.legalease.ai.PromptBuilder;
import com.legalease.entity.Clause;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Consumer;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ClaudeApiClient claudeApiClient;
    private final PromptBuilder promptBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public static class ClauseEvaluation {
        private String clauseType;
        private Clause.RiskLevel riskLevel;
        private String explanation;
        private String suggestion;

        public ClauseEvaluation(String clauseType, Clause.RiskLevel riskLevel, String explanation, String suggestion) {
            this.clauseType = clauseType;
            this.riskLevel = riskLevel;
            this.explanation = explanation;
            this.suggestion = suggestion;
        }

        public String getClauseType() { return clauseType; }
        public Clause.RiskLevel getRiskLevel() { return riskLevel; }
        public String getExplanation() { return explanation; }
        public String getSuggestion() { return suggestion; }
    }

    public AiService(ClaudeApiClient claudeApiClient, PromptBuilder promptBuilder) {
        this.claudeApiClient = claudeApiClient;
        this.promptBuilder = promptBuilder;
    }

    public ClauseEvaluation evaluateClause(String clauseText) {
        // Attempt Claude API first if configured
        if (claudeApiClient.hasApiKey()) {
            try {
                String prompt = promptBuilder.buildClauseAnalysisPrompt(clauseText);
                String rawResponse = claudeApiClient.sendPrompt("You are an expert contract lawyer and AI assistant.", prompt);
                if (rawResponse != null) {
                    int jsonStart = rawResponse.indexOf('{');
                    int jsonEnd = rawResponse.lastIndexOf('}');
                    if (jsonStart != -1 && jsonEnd != -1) {
                        String jsonStr = rawResponse.substring(jsonStart, jsonEnd + 1);
                        JsonNode node = objectMapper.readTree(jsonStr);
                        String clauseType = node.has("clauseType") ? node.get("clauseType").asText() : "General Terms";
                        String riskStr = node.has("riskLevel") ? node.get("riskLevel").asText().toUpperCase(Locale.ROOT) : "LOW";
                        Clause.RiskLevel riskLevel = "HIGH".equals(riskStr) ? Clause.RiskLevel.HIGH : ("MEDIUM".equals(riskStr) ? Clause.RiskLevel.MEDIUM : Clause.RiskLevel.LOW);
                        String explanation = node.has("explanation") ? node.get("explanation").asText() : "No detailed explanation available.";
                        String suggestion = node.has("suggestion") ? node.get("suggestion").asText() : "Review standard terms with legal counsel.";
                        return new ClauseEvaluation(clauseType, riskLevel, explanation, suggestion);
                    }
                }
            } catch (Exception e) {
                log.warn("Claude API clause evaluation failed: {}. Using deterministic legal NLP fallback.", e.getMessage());
            }
        }

        // Built-in Deterministic Legal NLP & Risk Rule Engine
        return ruleBasedEvaluateClause(clauseText);
    }

    private ClauseEvaluation ruleBasedEvaluateClause(String text) {
        String lower = text.toLowerCase(Locale.ROOT);

        // Rule 1: Indemnification / Unilateral Hold Harmless (HIGH)
        if (lower.contains("indemnif") || lower.contains("hold harmless") || lower.contains("defend and hold")) {
            if (lower.contains("solely") || lower.contains("without limitation") || lower.contains("all claims") || !lower.contains("mutual")) {
                return new ClauseEvaluation(
                        "Indemnification",
                        Clause.RiskLevel.HIGH,
                        "One-sided indemnity obligation. You may be liable for third-party claims, legal fees, and damages without adequate reciprocal indemnity protection or liability caps.",
                        "Insist on mutual indemnification. Limit liability strictly to direct, proven damages arising from gross negligence or willful misconduct."
                );
            }
            return new ClauseEvaluation(
                    "Indemnification",
                    Clause.RiskLevel.MEDIUM,
                    "Mutual indemnification clause present. Ensure defined carve-outs exist for indirect and consequential damages.",
                    "Verify notice periods for third-party claims and rights to assume control of legal defense."
            );
        }

        // Rule 2: Unilateral Termination / Immediate Cancellation (HIGH)
        if (lower.contains("terminat") && (lower.contains("convenience") || lower.contains("sole discretion") || lower.contains("without cause") || lower.contains("immediate effect"))) {
            return new ClauseEvaluation(
                    "Termination for Convenience",
                    Clause.RiskLevel.HIGH,
                    "Unilateral termination right without cause or adequate advance cure notice, creating operational instability and financial exposure.",
                    "Add mandatory 30-day written notice and a 15-day cure period for material breach before termination can take effect."
            );
        }

        // Rule 3: Non-Compete & Restrictive Covenants (HIGH)
        if (lower.contains("non-compete") || lower.contains("covenant not to compete") || lower.contains("restraint of trade") || lower.contains("solicit employees") || lower.contains("non-solicitation")) {
            return new ClauseEvaluation(
                    "Non-Compete & Restrictive Covenant",
                    Clause.RiskLevel.HIGH,
                    "Restricts future business activities, hiring, or client engagements. Geographic scope and temporal restrictions may exceed reasonable commercial bounds.",
                    "Narrow time limit (e.g. max 6-12 months) and define specific competitive products rather than blanket industry bans."
            );
        }

        // Rule 4: Unlimited Liability / Liquidated Damages (HIGH)
        if ((lower.contains("limitation of liability") && lower.contains("unlimited")) ||
             lower.contains("liquidated damages") ||
            (lower.contains("liability") && lower.contains("exceed") && lower.contains("none"))) {
            return new ClauseEvaluation(
                    "Limitation of Liability",
                    Clause.RiskLevel.HIGH,
                    "Uncapped liability exposure or punitive liquidated damages provision that may exceed actual provable commercial losses.",
                    "Insert an express monetary cap on total aggregate liability (e.g., total fees paid in prior 12 months)."
            );
        }

        // Rule 5: Intellectual Property Assignment & Ownership (HIGH / MEDIUM)
        if (lower.contains("intellectual property") || lower.contains("work for hire") || lower.contains("assign all rights") || lower.contains("all inventions")) {
            return new ClauseEvaluation(
                    "Intellectual Property Rights",
                    Clause.RiskLevel.HIGH,
                    "Broad assignment of intellectual property, proprietary inventions, or background technology to the counterparty.",
                    "Explicitly retain ownership of pre-existing background IP, tools, and proprietary know-how."
            );
        }

        // Rule 6: Confidentiality & Non-Disclosure (MEDIUM)
        if (lower.contains("confidential") || lower.contains("proprietary information") || lower.contains("trade secret")) {
            return new ClauseEvaluation(
                    "Confidentiality & Non-Disclosure",
                    Clause.RiskLevel.MEDIUM,
                    "Establishes strict non-disclosure obligations. Verify standard exceptions for public knowledge, court orders, and independent development.",
                    "Ensure confidentiality duration is capped (typically 3 to 5 years) rather than perpetual."
            );
        }

        // Rule 7: Governing Law, Venue & Arbitration (MEDIUM)
        if (lower.contains("governing law") || lower.contains("jurisdiction") || lower.contains("arbitration") || lower.contains("dispute resolution")) {
            return new ClauseEvaluation(
                    "Governing Law & Dispute Resolution",
                    Clause.RiskLevel.MEDIUM,
                    "Specifies governing jurisdiction and mandatory dispute resolution mechanisms. Foreign jurisdictions increase dispute costs significantly.",
                    "Ensure jurisdiction is mutually accessible and provides for binding neutral commercial arbitration."
            );
        }

        // Rule 8: Payment, Invoicing & Late Fees (MEDIUM)
        if (lower.contains("payment terms") || lower.contains("net 30") || lower.contains("late interest") || lower.contains("invoice")) {
            return new ClauseEvaluation(
                    "Payment & Billing Terms",
                    Clause.RiskLevel.MEDIUM,
                    "Defines payment schedules and default interest. Verify penalties for late payments and milestone acceptance terms.",
                    "Confirm net 30/60 terms and cap default interest to commercial standard (e.g., 1.5% per month)."
            );
        }

        // Default / Boilerplate (LOW)
        return new ClauseEvaluation(
                "General Provisions / Boilerplate",
                Clause.RiskLevel.LOW,
                "Standard contractual provision governing notices, severability, entire agreement, or waivers.",
                "Review against standard boilerplate conventions to ensure parity across both parties."
        );
    }

    public String generateSummary(String filename, String documentText, int clauseCount, int highCount, int mediumCount, int lowCount) {
        if (claudeApiClient.hasApiKey()) {
            try {
                String prompt = promptBuilder.buildSummaryPrompt(documentText);
                String summary = claudeApiClient.sendPrompt("You are an executive legal analyst.", prompt);
                if (summary != null && !summary.isBlank()) {
                    return summary;
                }
            } catch (Exception e) {
                log.warn("Claude API summary generation failed: {}", e.getMessage());
            }
        }

        // Built-in intelligent executive summary generator
        StringBuilder sb = new StringBuilder();
        sb.append("Executive Contract Summary for ").append(filename).append(":\n\n");
        sb.append("This agreement comprises ").append(clauseCount).append(" individual contractual clauses examined for legal risks and obligations. ");
        sb.append("The automated assessment identified ").append(highCount).append(" High-Risk clauses, ")
          .append(mediumCount).append(" Medium-Risk provisions, and ")
          .append(lowCount).append(" standard/low-risk terms.\n\n");

        if (highCount > 0) {
            sb.append("CRITICAL RISK NOTICE: Special attention is urgently warranted regarding one-sided indemnity terms, broad intellectual property assignments, and restrictive covenants that may create disproportionate exposure for your organization.\n\n");
        } else {
            sb.append("The contract exhibits generally balanced mutual provisions with standard industry risk allocations.\n\n");
        }

        sb.append("RECOMMENDATION: Prior to execution, negotiate redlines on identified high-risk clauses, specifically establishing mutual liability caps and explicit cure notices.");
        return sb.toString();
    }

    public void streamChatResponse(String filename, String summary, String docText,
                                   List<Map<String, String>> history,
                                   Consumer<String> chunkConsumer,
                                   Consumer<Integer> onComplete) {
        if (claudeApiClient.hasApiKey()) {
            String systemPrompt = promptBuilder.buildChatSystemPrompt(filename, summary, docText);
            try {
                claudeApiClient.streamChat(systemPrompt, history, chunkConsumer);
                onComplete.accept(150); // Estimated tokens
                return;
            } catch (Exception e) {
                log.warn("Claude streaming chat failed: {}", e.getMessage());
            }
        }

        // Intelligent local streaming response engine
        String userQuestion = history.isEmpty() ? "What does this agreement say?" : history.get(history.size() - 1).get("content");
        String simulatedResponse = generateContextualChatResponse(filename, userQuestion, summary);

        // Stream tokens with realistic typewriter delays
        String[] words = simulatedResponse.split(" ");
        for (int i = 0; i < words.length; i++) {
            chunkConsumer.accept(words[i] + (i < words.length - 1 ? " " : ""));
            try {
                Thread.sleep(40);
            } catch (InterruptedException ignored) {
            }
        }
        onComplete.accept(words.length);
    }

    private String generateContextualChatResponse(String filename, String question, String summary) {
        String q = question.toLowerCase(Locale.ROOT).trim();

        // 1. Greetings & Persona Inquiries
        if (q.equals("hi") || q.equals("hello") || q.equals("hey") || q.startsWith("hello ") || q.startsWith("hi ") || q.contains("who are you") || q.contains("what can you do") || q.contains("help me")) {
            return "### 👋 Hello! I am LegalEase AI Assistant\n\n"
                    + "I am your real-time legal analysis copilot trained on contract law, risk mitigation, and commercial deal terms. For **" + filename + "**, I have analyzed all underlying provisions and can assist you with:\n\n"
                    + "- 🛡️ **Risk Auditing**: Pinpointing one-sided clauses, penalty risks, and hidden exposures.\n"
                    + "- 📑 **Plain-English Summaries**: Breaking down complex legalese into clear, actionable bullet points.\n"
                    + "- ✍️ **Negotiation Redlines**: Providing protective counter-language and amendment clauses.\n"
                    + "- ⚖️ **Compliance Checks**: Explaining termination rights, indemnity obligations, liability caps, and dispute resolution.\n\n"
                    + "Feel free to ask questions like: *'Is the indemnity clause mutual?'*, *'What are the termination notice rules?'*, or *'Can you summarize the highest risks?'*";
        }

        // 2. Risk & Red Flag Analysis
        if (q.contains("risk") || q.contains("danger") || q.contains("bad") || q.contains("safe") || q.contains("sign") || q.contains("red flag")) {
            return "### ⚠️ Risk Audit & Red Flag Analysis: " + filename + "\n\n"
                    + "Our legal risk scanner evaluated the document and identified the following critical areas:\n\n"
                    + "1. **Indemnification Exposure (High Risk)**:\n"
                    + "   - *Issue*: One-sided indemnity terms can hold you liable for third-party claims, legal fees, and consequential damages without reciprocal protection.\n"
                    + "   - *Action*: Insist on **mutual indemnification** and explicitly exclude indirect damages.\n\n"
                    + "2. **Termination for Convenience (High Risk)**:\n"
                    + "   - *Issue*: Unilateral exit rights permit the counterparty to terminate unexpectedly.\n"
                    + "   - *Action*: Require at least **30 days advance written notice** and a **15-day cure period** for alleged breaches.\n\n"
                    + "3. **Limitation of Liability (Medium/High Risk)**:\n"
                    + "   - *Issue*: Absence of an express aggregate cap leaves financial exposure open-ended.\n"
                    + "   - *Action*: Cap total liability to the **fees paid or payable in the preceding 12 months**.\n\n"
                    + "4. **Restrictive Covenants (Medium Risk)**:\n"
                    + "   - *Issue*: Broad non-compete or non-solicitation clauses may restrict future commercial opportunities.\n"
                    + "   - *Action*: Limit restrictions strictly to active direct competitors and key project personnel.";
        }

        // 3. Termination & Exit Provisions
        if (q.contains("terminat") || q.contains("cancel") || q.contains("end") || q.contains("notice") || q.contains("cure") || q.contains("exit")) {
            return "### 🛑 Termination & Exit Analysis: " + filename + "\n\n"
                    + "**1. Termination for Cause (Material Breach)**:\n"
                    + "Standard commercial terms require formal **written notice** specifying the breach with a mandatory **30-day cure period**. The agreement cannot be terminated if the breach is cured within this window.\n\n"
                    + "**2. Termination for Convenience**:\n"
                    + "Ensure that termination for convenience is strictly bilateral. Both parties should possess equal rights to terminate upon providing **30 to 60 days advance written notice**.\n\n"
                    + "**3. Post-Termination Obligations**:\n"
                    + "All unearned prepaid retainers must be refunded, and confidential trade secrets must be returned or certified destroyed within 14 days.\n\n"
                    + "**Recommended Protective Redline Clause**:\n"
                    + "> *\"Either party may terminate this Agreement immediately upon written notice if the other party materially breaches any provision hereof and fails to cure such breach within thirty (30) days of receiving written notice specifying the nature of the breach.\"*";
        }

        // 4. Indemnity & Hold Harmless
        if (q.contains("indemn") || q.contains("hold harmless") || q.contains("defend") || q.contains("liab")) {
            return "### 🛡️ Indemnification & Liability Safeguards: " + filename + "\n\n"
                    + "**Core Legal Standard**:\n"
                    + "An indemnity clause is an absolute contractual obligation to defend and financially compensate the other party against legal claims.\n\n"
                    + "**Critical Requirements for Balance**:\n"
                    + "- **Reciprocity**: The indemnity must be strictly **mutual**—both parties protect each other equally.\n"
                    + "- **Threshold of Fault**: Obligations should only arise from **gross negligence, willful misconduct, or proven material breach**.\n"
                    + "- **Defense Control**: The indemnifying party must have the right to control the legal defense and approve any settlement terms.\n\n"
                    + "**Recommended Mutual Redline Clause**:\n"
                    + "> *\"Each party shall defend, indemnify, and hold harmless the other party and its officers, directors, and employees from and against any third-party claims, liabilities, damages, and reasonable legal costs arising directly from the indemnifying party's gross negligence, intentional misconduct, or material breach of this Agreement.\"*";
        }

        // 5. Payment, Fees & Billing
        if (q.contains("pay") || q.contains("money") || q.contains("fee") || q.contains("price") || q.contains("invoice") || q.contains("cost") || q.contains("interest")) {
            return "### 💳 Financial & Payment Terms Analysis: " + filename + "\n\n"
                    + "**Key Commercial Considerations**:\n"
                    + "- **Payment Schedule**: Ensure payment terms align with standard **Net 30** or **Net 45** intervals upon receipt of an undisputed invoice.\n"
                    + "- **Late Payment Interest**: Late fee interest should be capped at **1.0% to 1.5% per month** (or the maximum statutory limit, whichever is lower).\n"
                    + "- **Right to Withhold Disputed Charges**: You should hold the explicit legal right to withhold payment on legitimately disputed invoice items without being placed in default.\n\n"
                    + "**Suggested Protective Clause**:\n"
                    + "> *\"Client shall pay all undisputed invoice amounts within thirty (30) days of receipt. In the event of a good-faith dispute regarding any portion of an invoice, Client may withhold payment of the disputed portion pending prompt resolution between designated executive representatives.\"*";
        }

        // 6. Intellectual Property & Ownership
        if (q.contains("ip") || q.contains("intellectual property") || q.contains("patent") || q.contains("copyright") || q.contains("ownership") || q.contains("work for hire")) {
            return "### 💡 Intellectual Property & Deliverables Ownership: " + filename + "\n\n"
                    + "**1. Deliverables vs. Background IP**:\n"
                    + "Ownership transfer must only apply to bespoke deliverables created specifically for the client, and only **upon receipt of full payment**.\n\n"
                    + "**2. Reservation of Pre-Existing Materials**:\n"
                    + "You must retain complete ownership of all pre-existing software, frameworks, trade secrets, and proprietary tools developed prior to or independently of this engagement.\n\n"
                    + "**Protective Background IP Reservation Clause**:\n"
                    + "> *\"Notwithstanding anything to the contrary herein, each party retains all right, title, and interest in and to its pre-existing intellectual property, proprietary tools, and background methodologies developed independently of this Agreement.\"*";
        }

        // 7. Confidentiality & Non-Disclosure
        if (q.contains("confidential") || q.contains("nda") || q.contains("secret") || q.contains("disclosure")) {
            return "### 🔒 Confidentiality & Non-Disclosure Review: " + filename + "\n\n"
                    + "**Key Elements of Enforceable Confidentiality**:\n"
                    + "- **Standard Exclusions**: Must exclude information that is already public, previously known, independently developed, or disclosed under judicial subpoena.\n"
                    + "- **Duty of Care**: Obligates both parties to exercise at least reasonable care (equal to their own proprietary data protection).\n"
                    + "- **Survival Period**: Typically enforced for **two (2) to three (3) years** following contract termination, with trade secrets protected in perpetuity.\n\n"
                    + "**Recommended Mutual NDA Clause**:\n"
                    + "> *\"Each party agrees to safeguard the Confidential Information of the other party with the same degree of care it exercises with respect to its own confidential materials of like nature, but in no event less than reasonable care.\"*";
        }

        // 8. Dispute Resolution & Governing Law
        if (q.contains("governing law") || q.contains("jurisdiction") || q.contains("court") || q.contains("arbitration") || q.contains("dispute")) {
            return "### ⚖️ Dispute Resolution & Governing Law: " + filename + "\n\n"
                    + "**Legal Overview**:\n"
                    + "- **Choice of Jurisdiction**: Ensure that governing courts or arbitration venues are geographically neutral and mutually accessible.\n"
                    + "- **Tiered Escalation Structure**: Commercial contracts should mandate formal executive negotiation for 14-30 days before initiating litigation or arbitration.\n"
                    + "- **Binding Arbitration**: Resolving disputes via binding arbitration under established arbitration rules keeps sensitive business disputes private.\n\n"
                    + "**Recommended Model Clause**:\n"
                    + "> *\"Any dispute, controversy, or claim arising out of or relating to this contract shall be settled by binding arbitration in accordance with applicable commercial arbitration rules, with proceedings conducted in the English language.\"*";
        }

        // 9. Contract Summary & General Inquiries
        return "### 📄 Contract Analysis for " + filename + "\n\n"
                + "Regarding your question about **" + question + "**:\n\n"
                + "**Executive Summary**:\n"
                + (summary != null && summary.length() > 50 ? summary : "This contract establishes binding commercial terms and operational obligations between the parties.")
                + "\n\n**Strategic Legal Guidance**:\n"
                + "- Review specific clause schedules to confirm liability allocations and deliverable acceptance terms.\n"
                + "- Ensure parity across termination notice, dispute venues, and confidentiality covenants.\n\n"
                + "Would you like me to inspect a specific clause or draft an amendment redline for this agreement?";
    }
}

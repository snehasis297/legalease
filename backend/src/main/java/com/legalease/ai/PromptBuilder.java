package com.legalease.ai;

import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildClauseAnalysisPrompt(String clauseText) {
        return """
            You are a specialized Legal AI contract analysis assistant.
            Analyze the following legal clause in depth and respond ONLY with valid JSON in this exact structure:
            {
              "clauseType": "<Category like Indemnity, Termination, Liability, Non-Compete, Confidentiality, IP Assignment, Governing Law>",
              "riskLevel": "<LOW | MEDIUM | HIGH>",
              "explanation": "<Concise breakdown of legal implications, ambiguities, or traps in this clause>",
              "suggestion": "<Actionable recommendation or alternate redlined wording to protect the client>"
            }

            Clause to analyze:
            \"\"\"
            """ + clauseText + """
            \"\"\"
            """;
    }

    public String buildSummaryPrompt(String fullDocumentText) {
        return """
            You are an elite legal contract counsel. Provide a concise executive legal summary of this contract.
            Highlight the primary purpose, parties' key obligations, governing law, and any critical risks or one-sided provisions.
            Keep the response to 3-4 structured paragraphs.

            Contract Text:
            \"\"\"
            """ + fullDocumentText + """
            \"\"\"
            """;
    }

    public String buildChatSystemPrompt(String originalFilename, String fullSummary, String documentText) {
        return "You are LegalEase AI, an expert contract attorney assisting a client with their legal document named '"
                + originalFilename + "'.\n\n"
                + "DOCUMENT EXECUTIVE SUMMARY:\n" + fullSummary + "\n\n"
                + "FULL DOCUMENT TEXT:\n" + (documentText.length() > 6000 ? documentText.substring(0, 6000) + "..." : documentText) + "\n\n"
                + "Answer questions accurately based on this contract. Cite relevant clauses, highlight risks, explain legal jargon in plain English, and provide practical legal advice.";
    }
}

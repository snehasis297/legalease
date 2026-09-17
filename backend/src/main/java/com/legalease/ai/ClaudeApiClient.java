package com.legalease.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

@Component
public class ClaudeApiClient {

    private static final Logger log = LoggerFactory.getLogger(ClaudeApiClient.class);

    @Value("${claude.api.key:}")
    private String apiKey;

    @Value("${claude.model:claude-sonnet-4-6}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean hasApiKey() {
        return apiKey != null && !apiKey.trim().isEmpty() && !apiKey.contains("${");
    }

    public String sendPrompt(String systemPrompt, String userMessage) {
        if (!hasApiKey()) {
            return null;
        }

        try {
            URL url = new URL("https://api.anthropic.com/v1/messages");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("x-api-key", apiKey);
            conn.setRequestProperty("anthropic-version", "2023-06-01");
            conn.setRequestProperty("content-type", "application/json");
            conn.setDoOutput(true);
            conn.setConnectTimeout(20000);
            conn.setReadTimeout(60000);

            Map<String, Object> payload = Map.of(
                    "model", modelName,
                    "max_tokens", 2048,
                    "system", systemPrompt != null ? systemPrompt : "You are LegalEase AI.",
                    "messages", List.of(Map.of("role", "user", "content", userMessage))
            );

            String requestJson = objectMapper.writeValueAsString(payload);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(requestJson.getBytes(StandardCharsets.UTF_8));
            }

            int status = conn.getResponseCode();
            if (status == 200) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    JsonNode root = objectMapper.readTree(reader);
                    JsonNode contentArr = root.get("content");
                    if (contentArr != null && contentArr.isArray() && contentArr.size() > 0) {
                        return contentArr.get(0).get("text").asText();
                    }
                }
            } else {
                log.warn("Claude API returned HTTP status {}", status);
            }
        } catch (Exception e) {
            log.error("Claude API invocation error: {}", e.getMessage());
        }
        return null;
    }

    public void streamChat(String systemPrompt, List<Map<String, String>> messages, Consumer<String> chunkConsumer) {
        if (!hasApiKey()) {
            return;
        }

        try {
            URL url = new URL("https://api.anthropic.com/v1/messages");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("x-api-key", apiKey);
            conn.setRequestProperty("anthropic-version", "2023-06-01");
            conn.setRequestProperty("content-type", "application/json");
            conn.setRequestProperty("accept", "text/event-stream");
            conn.setDoOutput(true);
            conn.setConnectTimeout(20000);
            conn.setReadTimeout(90000);

            Map<String, Object> payload = Map.of(
                    "model", modelName,
                    "max_tokens", 1024,
                    "stream", true,
                    "system", systemPrompt != null ? systemPrompt : "You are LegalEase AI.",
                    "messages", messages
            );

            String requestJson = objectMapper.writeValueAsString(payload);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(requestJson.getBytes(StandardCharsets.UTF_8));
            }

            int status = conn.getResponseCode();
            if (status == 200) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        if (line.startsWith("data: ")) {
                            String data = line.substring(6).trim();
                            if ("[DONE]".equals(data)) break;
                            try {
                                JsonNode eventNode = objectMapper.readTree(data);
                                String type = eventNode.has("type") ? eventNode.get("type").asText() : "";
                                if ("content_block_delta".equals(type)) {
                                    JsonNode delta = eventNode.get("delta");
                                    if (delta != null && delta.has("text")) {
                                        chunkConsumer.accept(delta.get("text").asText());
                                    }
                                }
                            } catch (Exception ignored) {
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Claude streaming error: {}", e.getMessage());
        }
    }
}

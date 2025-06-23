package com.email.assistant.app;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class EmailGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(EmailGeneratorService.class);

    private final WebClient webClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public EmailGeneratorService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public String generateEmailReply(EmailRequest emailRequest) {
        logger.info("Received EmailRequest with content: {}, tone: {}, language: {}, customInstructions: {}",
                emailRequest.getEmailContent(), emailRequest.getTone(), emailRequest.getLanguage(), emailRequest.getCustomInstructions());

        String prompt = buildPrompt(emailRequest);

        logger.info("Constructed prompt: {}", prompt);

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", prompt)
                        })
                }
        );

        String response = webClient.post()
                .uri(geminiApiUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        String reply = extractResponseContent(response);
        logger.info("Generated reply: {}", reply);
        return reply;
    }

    private String extractResponseContent(String response) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response);
            String content = rootNode.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text")
                    .asText();
            if (content.isEmpty()) {
                logger.warn("Empty response content received from API");
                return "Error: Empty response from API";
            }
            return content;
        } catch (Exception e) {
            logger.error("Error processing API response: {}", e.getMessage(), e);
            return "Error processing request: " + e.getMessage();
        }
    }

    private String buildPrompt(EmailRequest emailRequest) {
        String tone = emailRequest.getTone() != null ? emailRequest.getTone().toLowerCase() : "professional";
        String language = emailRequest.getLanguage() != null ? emailRequest.getLanguage().toLowerCase() : "english";
        String customInstructions = emailRequest.getCustomInstructions() != null ? emailRequest.getCustomInstructions() : "";

        if (!isValidTone(tone)) {
            logger.warn("Invalid tone received: {}, defaulting to professional", tone);
            tone = "professional";
        }

        if (!isValidLanguage(language)) {
            logger.warn("Invalid language received: {}, defaulting to English", language);
            language = "english";
        }

        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert email assistant. Generate an email reply for the following email content in a ")
                .append(tone)
                .append(" tone and in ")
                .append(language)
                .append(" language. Follow these guidelines:\n");

        // Tone-specific instructions
        switch (tone) {
            case "professional":
                prompt.append("- Use formal language, concise sentences, and a polite tone.\n")
                        .append("- Avoid slang or overly casual phrases.\n")
                        .append("- Example: 'Dear [Name], Thank you for your email. I am pleased to assist you with...'");
                break;
            case "friendly":
                prompt.append("- Use warm, approachable language with a conversational tone.\n")
                        .append("- Incorporate light pleasantries, e.g., 'I hope you're doing well!'.\n")
                        .append("- Example: 'Hi [Name], Great to hear from you! I'm happy to help with...'");
                break;
            case "formal":
                prompt.append("- Use highly formal language, avoiding contractions (e.g., 'do not' instead of 'don't').\n")
                        .append("- Maintain a respectful and structured tone.\n")
                        .append("- Example: 'Dear [Name], I am writing to respond to your recent correspondence...'");
                break;
            case "casual":
                prompt.append("- Use relaxed, informal language with a conversational flow.\n")
                        .append("- Incorporate casual phrases, e.g., 'Hey, no worries!'.\n")
                        .append("- Example: 'Hey [Name], Thanks for reaching out! Here's what I can do...'");
                break;
            case "empathetic":
                prompt.append("- Use compassionate, understanding language to show empathy.\n")
                        .append("- Acknowledge the recipient's emotions or situation.\n")
                        .append("- Example: 'Dear [Name], I'm so sorry to hear about your situation. Here's how I can support you...'");
                break;
        }

        // Language-specific instructions
        prompt.append("\nLanguage Instructions:\n")
                .append("- Generate the reply in ").append(language).append(".\n")
                .append("- If the original email is in a different language, translate it to ").append(language)
                .append(" for context before generating the reply.\n");

        // Custom instructions
        if (!customInstructions.isEmpty()) {
            prompt.append("\nCustom Instructions:\n")
                    .append("- Incorporate the following user instructions: ").append(customInstructions).append("\n");
        }

        prompt.append("\nInstructions:\n")
                .append("- Reply directly to the content of the original email provided.\n")
                .append("- Return only the email body content, without any subject line, signature, or additional commentary.\n")
                .append("- Ensure the reply is concise, relevant, and matches the specified tone and language.\n")
                .append("\nOriginal email:\n")
                .append(emailRequest.getEmailContent());

        return prompt.toString();
    }

    private boolean isValidTone(String tone) {
        return tone != null &&
                (tone.equalsIgnoreCase("professional") ||
                        tone.equalsIgnoreCase("friendly") ||
                        tone.equalsIgnoreCase("formal") ||
                        tone.equalsIgnoreCase("casual") ||
                        tone.equalsIgnoreCase("empathetic"));
    }

    private boolean isValidLanguage(String language) {
        return language != null &&
                (language.equalsIgnoreCase("english") ||
                        language.equalsIgnoreCase("spanish") ||
                        language.equalsIgnoreCase("french") ||
                        language.equalsIgnoreCase("german") ||
                        language.equalsIgnoreCase("chinese") ||
                        language.equalsIgnoreCase("japanese") ||
                        language.equalsIgnoreCase("hindi")); // Add more as needed
    }
}
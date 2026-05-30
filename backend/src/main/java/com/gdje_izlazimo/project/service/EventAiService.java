package com.gdje_izlazimo.project.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gdje_izlazimo.project.dto.response.AiEventGenerateResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class EventAiService {

    private static final Logger log = LoggerFactory.getLogger(EventAiService.class);
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024;
    private static final int MAX_NAME_LENGTH = 150;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public EventAiService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model:llama-3.2-11b-vision-preview}") String model
    ) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.groq.com/openai/v1")
                .build();
        this.objectMapper = objectMapper;
        this.apiKey = apiKey;
        this.model = model;
    }

    public AiEventGenerateResponse generateFromImage(MultipartFile file) {
        validateFile(file);

        String base64Image;
        String mimeType;
        try {
            base64Image = Base64.getEncoder().encodeToString(file.getBytes());
            mimeType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
        } catch (Exception e) {
            throw new IllegalArgumentException("Ne mogu pročitati fajl slike: " + e.getMessage());
        }

        String prompt = """
                Analiziraj ovaj poster događaja za Sarajevo nightlife platformu "Gdje Izlazimo".
                Vrati SAMO validan JSON, bez markdown formatiranja, bez objašnjenja, bez teksta prije ili poslije JSON-a.
                
                Generiši kratak atraktivan naziv događaja i čist opis na bosanskom jeziku.
                Izvuci datum i vrijeme SAMO ako je jasno vidljivo na posteru.
                Ako nisi siguran za datum/vrijeme, vrati null za eventDateTime.
                Izbjegaj hashtagove, previše emojija i Instagram stil pisanja.
                
                Vrati ISKLJUČIVO ovaj JSON format:
                {"name":"naziv događaja max 150 karaktera","description":"2-4 kratke rečenice na bosanskom","eventDateTime":"YYYY-MM-DDTHH:mm:ss ili null","confidence":0.0}
                """;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", List.of(
                                Map.of(
                                        "type", "image_url",
                                        "image_url", Map.of(
                                                "url", "data:" + mimeType + ";base64," + base64Image
                                        )
                                ),
                                Map.of(
                                        "type", "text",
                                        "text", prompt
                                )
                        )
                )),
                "max_tokens", 512,
                "temperature", 0.3
        );

        String rawResponse;
        try {
            rawResponse = webClient.post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), response ->
                            response.bodyToMono(String.class).map(body -> {
                                log.error("Groq 4xx error body: {}", body);
                                return new RuntimeException("Groq error: " + body);
                            })
                    )
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Groq API poziv nije uspio", e);
            throw new RuntimeException("AI servis trenutno nije dostupan. Pokušaj ponovo.");
        }

        return parseResponse(rawResponse);
    }

    private AiEventGenerateResponse parseResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);

            JsonNode textNode = root
                    .path("choices").path(0)
                    .path("message").path("content");

            if (textNode.isMissingNode()) {
                log.error("Groq response nema content node: {}", rawResponse);
                throw new RuntimeException("Neočekivan odgovor od AI servisa.");
            }

            String jsonText = stripMarkdown(textNode.asText().trim());
            JsonNode parsed = objectMapper.readTree(jsonText);

            String name = parsed.path("name").asText("Novi događaj");
            if (name.isBlank()) name = "Novi događaj";
            if (name.length() > MAX_NAME_LENGTH) name = name.substring(0, MAX_NAME_LENGTH);

            String description = parsed.path("description").asText("");
            if (description.isBlank()) description = "";

            LocalDateTime eventDateTime = null;
            JsonNode dtNode = parsed.path("eventDateTime");
            if (!dtNode.isNull() && !dtNode.isMissingNode()) {
                String dtRaw = dtNode.asText("").trim();
                if (!dtRaw.isBlank() && !dtRaw.equalsIgnoreCase("null")) {
                    eventDateTime = parseDateTime(dtRaw);
                }
            }

            Double confidence = null;
            JsonNode confNode = parsed.path("confidence");
            if (!confNode.isMissingNode() && !confNode.isNull()) {
                confidence = confNode.asDouble(0.0);
            }

            return new AiEventGenerateResponse(name, description, eventDateTime, confidence);

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Parsiranje Groq odgovora nije uspjelo. Raw: {}", rawResponse, e);
            throw new RuntimeException("Nije moguće obraditi AI odgovor. Pokušaj ponovo.");
        }
    }

    private String stripMarkdown(String text) {
        if (text.startsWith("```")) {
            text = text.replaceAll("^```[a-zA-Z]*\\n?", "");
            text = text.replaceAll("```$", "").trim();
        }
        return text;
    }

    private LocalDateTime parseDateTime(String raw) {
        DateTimeFormatter[] formatters = {
                DateTimeFormatter.ISO_LOCAL_DATE_TIME,
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
        };
        for (DateTimeFormatter fmt : formatters) {
            try {
                return LocalDateTime.parse(raw, fmt);
            } catch (DateTimeParseException ignored) {}
        }
        log.warn("Nije moguće parsirati datum '{}', ostavljamo null", raw);
        return null;
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fajl je obavezan.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Dozvoljeni su samo fajlovi slika.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Maksimalna veličina fajla je 10MB.");
        }
    }
}
package com.cby.smartfarm.rag.embedding;

import com.cby.smartfarm.rag.config.EmbeddingProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class OpenAiCompatibleEmbeddingClient implements EmbeddingClient {

    private final EmbeddingProperties properties;

    @Override
    @SuppressWarnings("unchecked")
    public List<Float> embed(String text) {
        if (properties.getBaseUrl() == null || properties.getBaseUrl().isBlank()) {
            throw new IllegalStateException("embedding.base-url is required when embedding.provider=openai_compatible");
        }
        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            throw new IllegalStateException("embedding.api-key is required when embedding.provider=openai_compatible");
        }

        Map<String, Object> response = WebClient.builder()
                .baseUrl(properties.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build()
                .post()
                .uri("/embeddings")
                .bodyValue(Map.of("model", properties.getModel(), "input", text == null ? "" : text))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        try {
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.get("data");
            Map<String, Object> first = data.get(0);
            List<Number> raw = (List<Number>) first.get("embedding");
            List<Float> vector = new ArrayList<>(raw.size());
            for (Number number : raw) {
                vector.add(number.floatValue());
            }
            if (vector.size() != dimension()) {
                throw new IllegalStateException("Embedding dimension mismatch: expected "
                        + dimension() + ", got " + vector.size());
            }
            return vector;
        } catch (Exception e) {
            throw new IllegalStateException("OpenAI-compatible embedding request failed; check baseUrl/model/dimension", e);
        }
    }

    @Override
    public List<List<Float>> embedBatch(List<String> texts) {
        return texts.stream().map(this::embed).toList();
    }

    @Override
    public int dimension() {
        return properties.getDimension();
    }

    @Override
    public String provider() {
        return "openai_compatible";
    }
}

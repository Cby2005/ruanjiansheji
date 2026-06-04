package com.cby.smartfarm.rag.embedding;

import com.cby.smartfarm.rag.config.EmbeddingProperties;
import lombok.RequiredArgsConstructor;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
public class MockEmbeddingClient implements EmbeddingClient {

    private final EmbeddingProperties properties;

    @Override
    public List<Float> embed(String text) {
        int dim = dimension();
        List<Float> vector = new ArrayList<>(dim);
        byte[] seed = digest(text == null ? "" : text);
        for (int i = 0; i < dim; i++) {
            int value = seed[i % seed.length] & 0xff;
            float signed = (value - 127.5f) / 127.5f;
            vector.add(signed);
            if ((i + 1) % seed.length == 0) {
                seed = digest(new String(seed, StandardCharsets.ISO_8859_1) + i + text);
            }
        }
        return normalize(vector);
    }

    @Override
    public int dimension() {
        return properties.getDimension();
    }

    @Override
    public String provider() {
        return "mock";
    }

    private byte[] digest(String text) {
        try {
            return MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("Mock embedding hash failed", e);
        }
    }

    private List<Float> normalize(List<Float> vector) {
        double sum = 0.0;
        for (Float item : vector) {
            sum += item * item;
        }
        double norm = Math.sqrt(sum);
        if (norm == 0) {
            return vector;
        }
        return vector.stream().map(item -> (float) (item / norm)).toList();
    }
}

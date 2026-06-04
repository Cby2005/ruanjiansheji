package com.cby.smartfarm.rag.embedding;

import java.util.List;

public interface EmbeddingClient {
    List<Float> embed(String text);

    default List<List<Float>> embedBatch(List<String> texts) {
        return texts.stream().map(this::embed).toList();
    }

    int dimension();

    String provider();
}

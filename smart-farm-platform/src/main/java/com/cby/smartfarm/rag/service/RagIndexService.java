package com.cby.smartfarm.rag.service;

import com.cby.smartfarm.rag.dto.RagChunkDTO;
import com.cby.smartfarm.rag.embedding.EmbeddingClient;
import com.cby.smartfarm.rag.milvus.MilvusRagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RagIndexService {

    private final EmbeddingClient embeddingClient;
    private final MilvusRagRepository repository;

    public Map<String, Object> index(List<RagChunkDTO> chunks, boolean recreate) {
        List<String> texts = chunks.stream().map(RagChunkDTO::getChunkText).toList();
        List<List<Float>> vectors = embeddingClient.embedBatch(texts);
        int written = repository.upsert(chunks, vectors, recreate);
        return Map.of(
                "inputChunks", chunks.size(),
                "embeddedChunks", vectors.size(),
                "writtenChunks", written,
                "embeddingProvider", embeddingClient.provider()
        );
    }
}

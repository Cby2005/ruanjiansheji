package com.cby.smartfarm.rag.milvus;

import com.cby.smartfarm.rag.config.MilvusProperties;
import com.cby.smartfarm.rag.dto.RagChunkDTO;
import com.cby.smartfarm.rag.dto.RagSearchRequest;
import com.cby.smartfarm.rag.dto.RagSearchResultDTO;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.UpsertReq;
import io.milvus.v2.service.vector.request.data.BaseVector;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;

@Repository
@RequiredArgsConstructor
public class MilvusRagRepository {

    private static final int MAX_CHUNK_TEXT_LENGTH = 8192;
    private static final Gson GSON = new Gson();

    private final MilvusClientProvider clientProvider;
    private final MilvusProperties properties;
    private final MilvusCollectionManager collectionManager;

    public int upsert(List<RagChunkDTO> chunks, List<List<Float>> vectors, boolean recreate) {
        MilvusClientV2 client = clientProvider.newClient();
        try {
        collectionManager.ensureCollection(client, recreate);
        if (chunks.size() != vectors.size()) {
            throw new IllegalArgumentException("chunks size must equal vectors size");
        }
        List<JsonObject> rows = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            rows.add(toRow(chunks.get(i), vectors.get(i)));
        }
        if (rows.isEmpty()) {
            return 0;
        }
        client.upsert(UpsertReq.builder()
                .databaseName(properties.getDatabase())
                .collectionName(properties.getCollection())
                .data(rows)
                .build());
        return rows.size();
        } finally {
            client.close();
        }
    }

    public List<RagSearchResultDTO> search(List<Float> vector, RagSearchRequest request) {
        MilvusClientV2 client = clientProvider.newClient();
        try {
        collectionManager.ensureCollection(client, false);
        List<BaseVector> vectors = List.of(new FloatVec(vector));
        int requestedTopK = request.getTopK() == null ? 5 : request.getTopK();
        int candidateTopK = request.getCrop() == null || request.getCrop().isBlank()
                ? requestedTopK
                : Math.min(Math.max(requestedTopK * 20, 50), 100);
        SearchResp response = client.search(SearchReq.builder()
                .databaseName(properties.getDatabase())
                .collectionName(properties.getCollection())
                .annsField(MilvusCollectionManager.VECTOR_FIELD)
                .metricType(IndexParam.MetricType.valueOf(properties.getMetricType()))
                .topK(candidateTopK)
                .filter(buildFilter(request))
                .outputFields(List.of("id", "article_id", "source", "title", "source_url",
                        "category", "publish_date", "chunk_index", "chunk_text", "entities", "created_at"))
                .data(vectors)
                .searchParams(Map.of("ef", 64))
                .build());

        if (response.getSearchResults() == null || response.getSearchResults().isEmpty()) {
            return List.of();
        }
        List<RagSearchResultDTO> candidates = response.getSearchResults().get(0).stream()
                .map(this::toResult)
                .sorted(Comparator.comparing(RagSearchResultDTO::getScore, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        List<RagSearchResultDTO> cropFiltered = candidates.stream()
                .filter(result -> cropMatches(result, request.getCrop()))
                .limit(requestedTopK)
                .toList();
        if (!cropFiltered.isEmpty()) {
            return cropFiltered;
        }
        return candidates.stream()
                .limit(requestedTopK)
                .toList();
        } finally {
            client.close();
        }
    }

    private JsonObject toRow(RagChunkDTO chunk, List<Float> vector) {
        if (chunk.getChunkText() != null && chunk.getChunkText().length() > MAX_CHUNK_TEXT_LENGTH) {
            throw new IllegalArgumentException("chunk_text length exceeds " + MAX_CHUNK_TEXT_LENGTH
                    + " for chunk_id=" + chunk.getChunkId());
        }
        if (vector.size() != properties.getEmbeddingDim()) {
            throw new IllegalArgumentException("Vector dimension mismatch for chunk_id=" + chunk.getChunkId()
                    + ": expected " + properties.getEmbeddingDim() + ", got " + vector.size());
        }
        JsonObject row = new JsonObject();
        row.addProperty("id", value(chunk.getChunkId()));
        row.addProperty("article_id", value(chunk.getArticleId()));
        row.addProperty("source", value(chunk.getSource()));
        row.addProperty("title", value(chunk.getTitle()));
        row.addProperty("source_url", value(chunk.getSourceUrl()));
        row.addProperty("category", value(chunk.getCategory()));
        row.addProperty("publish_date", value(chunk.getPublishDate()));
        row.addProperty("chunk_index", chunk.getChunkIndex() == null ? 0L : chunk.getChunkIndex());
        row.addProperty("chunk_text", value(chunk.getChunkText()));
        row.addProperty("entities", String.join("|", chunk.getEntities() == null ? List.of() : chunk.getEntities()));
        row.add("vector", GSON.toJsonTree(vector));
        row.addProperty("created_at", value(chunk.getCreatedAt() == null ? LocalDateTime.now().toString() : chunk.getCreatedAt()));
        return row;
    }

    private RagSearchResultDTO toResult(SearchResp.SearchResult result) {
        Map<String, Object> entity = result.getEntity();
        RagSearchResultDTO dto = new RagSearchResultDTO();
        dto.setChunkId(stringValue(entity, "id", String.valueOf(result.getId())));
        dto.setArticleId(stringValue(entity, "article_id", ""));
        dto.setSource(stringValue(entity, "source", ""));
        dto.setTitle(stringValue(entity, "title", ""));
        dto.setSourceUrl(stringValue(entity, "source_url", ""));
        dto.setCategory(stringValue(entity, "category", ""));
        dto.setPublishDate(stringValue(entity, "publish_date", ""));
        dto.setScore(result.getScore());
        dto.setChunkText(stringValue(entity, "chunk_text", ""));
        dto.setEntities(splitEntities(stringValue(entity, "entities", "")));
        return dto;
    }

    private String buildFilter(RagSearchRequest request) {
        List<String> clauses = new ArrayList<>();
        if (request.getSources() != null && !request.getSources().isEmpty()) {
            StringJoiner joiner = new StringJoiner(",", "source in [", "]");
            request.getSources().stream()
                    .filter(Objects::nonNull)
                    .map(this::escape)
                    .forEach(item -> joiner.add("\"" + item + "\""));
            clauses.add(joiner.toString());
        }
        return String.join(" and ", clauses);
    }

    private boolean cropMatches(RagSearchResultDTO result, String crop) {
        if (crop == null || crop.isBlank()) {
            return true;
        }
        String text = (result.getChunkText() + " " + result.getTitle() + " " + String.join("|", result.getEntities()));
        return text.contains(crop);
    }

    private String value(String value) {
        return value == null ? "" : value;
    }

    private String stringValue(Map<String, Object> entity, String key, String fallback) {
        Object value = entity == null ? null : entity.get(key);
        return value == null ? fallback : String.valueOf(value);
    }

    private List<String> splitEntities(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return java.util.Arrays.stream(value.split("\\|"))
                .filter(item -> !item.isBlank())
                .toList();
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

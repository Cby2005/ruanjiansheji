package com.cby.smartfarm.rag.service;

import com.cby.smartfarm.dto.KnowledgeGraphResult;
import com.cby.smartfarm.rag.config.EmbeddingProperties;
import com.cby.smartfarm.rag.dto.HybridSearchResponse;
import com.cby.smartfarm.rag.dto.KgEvidenceDTO;
import com.cby.smartfarm.rag.dto.RagSearchRequest;
import com.cby.smartfarm.rag.dto.RagSearchResponse;
import com.cby.smartfarm.rag.dto.RagSearchResultDTO;
import com.cby.smartfarm.rag.embedding.EmbeddingClient;
import com.cby.smartfarm.rag.milvus.MilvusRagRepository;
import com.cby.smartfarm.service.KnowledgeGraphService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagSearchService {

    private static final String MOCK_WARNING = "当前使用 MockEmbeddingClient，检索结果仅用于流程测试，不代表真实语义相似度。";

    private final EmbeddingClient embeddingClient;
    private final EmbeddingProperties embeddingProperties;
    private final MilvusRagRepository repository;
    private final KnowledgeGraphService knowledgeGraphService;

    public RagSearchResponse search(RagSearchRequest request) {
        RagSearchResponse response = new RagSearchResponse();
        response.setQuery(request.getQuery());
        response.setTopK(request.getTopK() == null ? 5 : request.getTopK());
        if (embeddingProperties.isMock()) {
            response.setWarning(MOCK_WARNING);
        }
        if (request.getQuery() == null || request.getQuery().isBlank()) {
            response.setResults(List.of());
            return response;
        }
        try {
            List<Float> vector = embeddingClient.embed(request.getQuery());
            response.setResults(repository.search(vector, request));
        } catch (Exception e) {
            log.warn("Milvus RAG search failed: {}", e.getMessage());
            response.setWarning(appendWarning(response.getWarning(),
                    "Milvus 检索不可用或 collection 尚未导入数据：" + e.getMessage()));
            response.setResults(List.of());
        }
        return response;
    }

    public HybridSearchResponse hybridSearch(RagSearchRequest request) {
        HybridSearchResponse response = new HybridSearchResponse();
        response.setQuery(request.getQuery());
        RagSearchResponse rag = search(request);
        response.setWarning(rag.getWarning());
        response.setRagResults(rag.getResults());
        response.setKgEvidence(loadKgEvidence(request));
        return response;
    }

    public List<KgEvidenceDTO> loadKgEvidence(RagSearchRequest request) {
        String keyword = firstNotBlank(request.getKgKeyword(), request.getCrop(), request.getQuery());
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        try {
            KnowledgeGraphResult graph = knowledgeGraphService.search(keyword, request.getCrop(), request.getQuery());
            Map<Long, String> names = new LinkedHashMap<>();
            for (KnowledgeGraphResult.GraphNode node : graph.getNodes()) {
                names.put(node.getId(), node.getName());
            }
            List<KgEvidenceDTO> evidence = new ArrayList<>();
            for (KnowledgeGraphResult.GraphLink link : graph.getLinks()) {
                evidence.add(new KgEvidenceDTO(
                        names.getOrDefault(link.getSource(), String.valueOf(link.getSource())),
                        link.getRelationType(),
                        names.getOrDefault(link.getTarget(), String.valueOf(link.getTarget())),
                        link.getDescription()
                ));
            }
            return evidence.stream().limit(20).toList();
        } catch (Exception e) {
            log.warn("KG evidence search failed: {}", e.getMessage());
            return List.of();
        }
    }

    private String firstNotBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String appendWarning(String current, String next) {
        if (current == null || current.isBlank()) {
            return next;
        }
        return current + " " + next;
    }
}

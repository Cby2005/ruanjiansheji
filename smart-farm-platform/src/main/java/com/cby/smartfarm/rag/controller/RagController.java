package com.cby.smartfarm.rag.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.rag.dto.HybridSearchResponse;
import com.cby.smartfarm.rag.dto.RagIndexRequest;
import com.cby.smartfarm.rag.dto.RagSearchRequest;
import com.cby.smartfarm.rag.dto.RagSearchResponse;
import com.cby.smartfarm.rag.service.RagIndexService;
import com.cby.smartfarm.rag.service.RagSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/rag")
@RequiredArgsConstructor
@Tag(name = "Milvus RAG 检索", description = "基于 Milvus 向量库的农技文档检索与 KG 混合检索")
public class RagController {

    private final RagSearchService ragSearchService;
    private final RagIndexService ragIndexService;

    @PostMapping("/search")
    @Operation(summary = "Milvus RAG 向量检索")
    public Result<RagSearchResponse> search(@RequestBody RagSearchRequest request) {
        return Result.success(ragSearchService.search(request));
    }

    @PostMapping("/hybrid-search")
    @Operation(summary = "Milvus RAG + 知识图谱混合检索")
    public Result<HybridSearchResponse> hybridSearch(@RequestBody RagSearchRequest request) {
        return Result.success(ragSearchService.hybridSearch(request));
    }

    @PostMapping("/index")
    @Operation(summary = "通过后端直接写入 chunk 到 Milvus")
    public Result<Map<String, Object>> index(@RequestBody RagIndexRequest request) {
        return Result.success(ragIndexService.index(
                request.getChunks(),
                Boolean.TRUE.equals(request.getRecreate())
        ));
    }
}

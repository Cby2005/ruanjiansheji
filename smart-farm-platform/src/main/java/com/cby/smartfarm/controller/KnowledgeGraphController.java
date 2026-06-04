package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.dto.KnowledgeGraphResult;
import com.cby.smartfarm.service.KnowledgeGraphService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/knowledge-graph")
@RequiredArgsConstructor
@Tag(name = "知识图谱 RAG", description = "轻量级农业知识图谱检索与 Agent 决策依据")
public class KnowledgeGraphController {

    private final KnowledgeGraphService knowledgeGraphService;

    @GetMapping("/overview")
    @Operation(summary = "获取知识图谱统计")
    public Result<Map<String, Object>> overview() {
        knowledgeGraphService.ensureInitialized();
        return Result.success(knowledgeGraphService.overview());
    }

    @GetMapping("/search")
    @Operation(summary = "检索知识图谱并返回 RAG 上下文")
    public Result<KnowledgeGraphResult> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String scenario) {
        return Result.success(knowledgeGraphService.search(query, crop, scenario));
    }

    @PostMapping("/rebuild")
    @Operation(summary = "从项目现有数据重建知识图谱")
    public Result<Map<String, Object>> rebuild() {
        knowledgeGraphService.rebuild();
        return Result.success(knowledgeGraphService.overview());
    }
}

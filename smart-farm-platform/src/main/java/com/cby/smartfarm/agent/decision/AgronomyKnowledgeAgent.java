package com.cby.smartfarm.agent.decision;

import com.cby.smartfarm.agent.decision.dto.AgentStepDTO;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import com.cby.smartfarm.rag.dto.RagSearchRequest;
import com.cby.smartfarm.rag.dto.RagSearchResponse;
import com.cby.smartfarm.rag.service.RagSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class AgronomyKnowledgeAgent {

    private final RagSearchService ragSearchService;

    public Result analyze(MilvusAgentDecisionRequest request) {
        RagSearchRequest ragRequest = new RagSearchRequest();
        ragRequest.setQuery(buildQuery(request));
        ragRequest.setTopK(5);
        ragRequest.setSources(List.of("agri_cn", "natesc"));
        ragRequest.setCrop(request.getCrop());
        RagSearchResponse search = ragSearchService.search(ragRequest);
        String result = search.getResults().isEmpty()
                ? "Milvus RAG 暂未检索到相关文章，建议先导入 agri.cn 或全国农技中心 chunk。"
                : "检索到 " + search.getResults().size() + " 条农技资料，可作为灌溉和病虫害巡查依据。";
        return new Result(new AgentStepDTO("农技知识Agent", result), search);
    }

    private String buildQuery(MilvusAgentDecisionRequest request) {
        return String.join(" ",
                safe(request.getCrop()),
                "土壤湿度低",
                "高温高湿",
                safe(request.getQuestion()),
                "灌溉 病虫害风险 防治措施");
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    public record Result(AgentStepDTO step, RagSearchResponse searchResponse) {
    }
}

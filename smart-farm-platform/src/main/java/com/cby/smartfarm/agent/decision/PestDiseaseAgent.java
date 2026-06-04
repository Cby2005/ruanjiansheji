package com.cby.smartfarm.agent.decision;

import com.cby.smartfarm.agent.decision.dto.AgentStepDTO;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import com.cby.smartfarm.rag.dto.KgEvidenceDTO;
import com.cby.smartfarm.rag.dto.RagSearchRequest;
import com.cby.smartfarm.rag.service.RagSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PestDiseaseAgent {

    private final RagSearchService ragSearchService;

    public Result analyze(MilvusAgentDecisionRequest request) {
        RagSearchRequest kgRequest = new RagSearchRequest();
        kgRequest.setQuery(buildQuery(request));
        kgRequest.setCrop(request.getCrop());
        kgRequest.setKgKeyword(request.getCrop());
        kgRequest.setKgDepth(2);
        List<KgEvidenceDTO> evidence = new ArrayList<>(ragSearchService.loadKgEvidence(kgRequest));
        if (evidence.isEmpty() && highTempHumidity(request)) {
            evidence.add(new KgEvidenceDTO("高温高湿", "INCREASES_RISK_OF", "赤霉病", "规则型兜底：高温高湿会提高真菌性病害风险"));
        }
        String result = evidence.isEmpty()
                ? "当前知识图谱未检索到明确病虫害风险关系，建议继续巡田观察。"
                : "根据知识图谱和环境因素，" + request.getCrop() + "可能存在病虫害风险，重点关注："
                + evidence.get(0).getTarget() + "。";
        return new Result(new AgentStepDTO("病虫害Agent", result), evidence);
    }

    private String buildQuery(MilvusAgentDecisionRequest request) {
        return String.join(" ", request.getCrop() == null ? "" : request.getCrop(), "高温", "高湿", "病虫害", "风险");
    }

    private boolean highTempHumidity(MilvusAgentDecisionRequest request) {
        return request.getTemperature() != null && request.getTemperature() >= 30
                && request.getHumidity() != null && request.getHumidity() >= 80;
    }

    public record Result(AgentStepDTO step, List<KgEvidenceDTO> evidence) {
    }
}

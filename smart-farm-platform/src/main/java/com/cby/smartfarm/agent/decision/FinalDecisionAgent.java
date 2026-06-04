package com.cby.smartfarm.agent.decision;

import com.cby.smartfarm.agent.decision.dto.AgentStepDTO;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class FinalDecisionAgent {

    public Result decide(MilvusAgentDecisionRequest request, List<String> riskHints, boolean hasPestRisk) {
        List<String> suggestions = new ArrayList<>();
        if (request.getSoilMoisture() != null && request.getSoilMoisture() < 25) {
            suggestions.add("适量灌溉");
        }
        if (request.getTemperature() != null && request.getTemperature() >= 30) {
            suggestions.add("加强田间通风");
        }
        if (hasPestRisk || (request.getHumidity() != null && request.getHumidity() >= 80)) {
            suggestions.add("加强病虫害巡查");
        }
        suggestions.add("用药前核对农药登记信息");

        String riskLevel = riskHints.size() >= 3 || hasPestRisk ? "中高风险" : riskHints.isEmpty() ? "低风险" : "中风险";
        String summary = "当前" + String.join("、", riskHints)
                + (hasPestRisk ? "，并存在潜在病虫害风险" : "")
                + "，建议" + String.join("、", suggestions) + "。";
        return new Result(riskLevel, summary, suggestions,
                new AgentStepDTO("综合决策Agent", summary));
    }

    public record Result(String riskLevel, String summary, List<String> suggestions, AgentStepDTO step) {
    }
}

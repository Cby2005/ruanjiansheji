package com.cby.smartfarm.agent.decision;

import com.cby.smartfarm.agent.decision.dto.AgentStepDTO;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class EnvironmentAgent {

    public AgentStepDTO analyze(MilvusAgentDecisionRequest request) {
        List<String> hints = riskHints(request);
        String result = "土壤湿度" + value(request.getSoilMoisture()) + "%，温度"
                + value(request.getTemperature()) + "℃，空气湿度" + value(request.getHumidity())
                + "%，风险提示：" + (hints.isEmpty() ? "暂无明显环境风险" : String.join("、", hints)) + "。";
        return new AgentStepDTO("环境监测Agent", result);
    }

    public List<String> riskHints(MilvusAgentDecisionRequest request) {
        List<String> hints = new ArrayList<>();
        if (request.getSoilMoisture() != null && request.getSoilMoisture() < 25) {
            hints.add("土壤湿度偏低");
        }
        if (request.getTemperature() != null && request.getTemperature() >= 30) {
            hints.add("高温");
        }
        if (request.getHumidity() != null && request.getHumidity() >= 80) {
            hints.add("高湿");
        }
        if (request.getPrecipitation() != null && request.getPrecipitation() <= 0.1) {
            hints.add("未来降雨不足");
        }
        return hints;
    }

    private String value(Double value) {
        return value == null ? "--" : String.format("%.1f", value);
    }
}

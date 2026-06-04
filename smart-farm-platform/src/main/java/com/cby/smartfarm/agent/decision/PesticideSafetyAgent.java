package com.cby.smartfarm.agent.decision;

import com.cby.smartfarm.agent.decision.dto.AgentStepDTO;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@Component
public class PesticideSafetyAgent {

    public static final String NOTICE = "具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。";

    public AgentStepDTO analyze(MilvusAgentDecisionRequest request) {
        String crop = request.getCrop() == null ? "" : request.getCrop();
        String matched = findRegistrationLine(crop);
        String result = matched == null
                ? "当前系统未检索到可靠登记信息，不生成具体药剂建议。" + NOTICE
                : "从已导入农药登记数据中检索到相关记录：" + matched + "。" + NOTICE;
        return new AgentStepDTO("农药安全Agent", result);
    }

    private String findRegistrationLine(String crop) {
        for (Path path : List.of(
                Path.of("..", "tools", "pesticide_import", "output", "pesticide_registration.csv"),
                Path.of("tools", "pesticide_import", "output", "pesticide_registration.csv")
        )) {
            if (!Files.exists(path)) {
                continue;
            }
            try {
                return Files.lines(path)
                        .skip(1)
                        .filter(line -> crop.isBlank() || line.contains(crop))
                        .findFirst()
                        .orElse(null);
            } catch (Exception ignored) {
                return null;
            }
        }
        return null;
    }
}

package com.cby.smartfarm.agent;

import com.cby.smartfarm.agent.dto.*;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import com.cby.smartfarm.entity.AgentDecisionLog;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.AgentDecisionLogRepository;
import com.cby.smartfarm.service.DeviceService;
import com.cby.smartfarm.service.EnvironmentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AgentWorkflowService {

    private final EnvironmentService environmentService;
    private final AgricultureDecisionService agricultureDecisionService;
    private final DeviceService deviceService;
    private final AgentDecisionLogRepository logRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AgentWorkflowResult run(AgentDecisionRequest request) {
        String workflowId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        @SuppressWarnings("unchecked")
        var collectionResult = environmentService.collectAndControl();
        EnvironmentRecord record = (EnvironmentRecord) collectionResult.get("environmentRecord");
        @SuppressWarnings("unchecked")
        List<AlertRecord> alerts = (List<AlertRecord>) collectionResult.getOrDefault("alerts", List.of());

        AgentDecisionRequest decisionRequest = normalizeRequest(request, record);
        AgentDecisionPlan plan = agricultureDecisionService.decide(decisionRequest);
        saveExpertLogs(workflowId, plan, record);

        List<AgentControlCommand> commands = generateCommands(plan);
        AgentSafetyReview review = reviewSafety(plan, commands);
        saveLog(workflowId, "安全审核 Agent", "SAFETY_REVIEW", review.getRiskLevel(),
                "待审核命令数: " + commands.size(), review.getConclusion(), review.isApproved(), commands);

        List<AgentExecutionResult> executionResults = executeVirtualDevices(workflowId, commands, review);
        saveLog(workflowId, "总控调度 Agent", "WORKFLOW_SUMMARY", plan.getOverallRiskLevel(),
                "模拟采集记录ID: " + record.getId(), plan.getSummary(), review.isApproved(), executionResults);

        AgentWorkflowResult result = new AgentWorkflowResult();
        result.setWorkflowId(workflowId);
        result.setPipeline(List.of(
                "模拟传感器数据",
                "环境数据采集中心",
                "多个专家 Agent 分别分析",
                "总控调度 Agent 汇总建议",
                "安全审核 Agent 审核风险",
                "生成设备控制命令",
                "虚拟设备执行",
                "记录 Agent 决策日志、设备控制日志、预警信息"
        ));
        result.setEnvironmentRecord(record);
        result.setAlerts(alerts);
        result.setDecisionPlan(plan);
        result.setCommands(commands);
        result.setSafetyReview(review);
        result.setExecutionResults(executionResults);
        result.setDecisionLogs(logRepository.findByWorkflowIdOrderByCreateTimeAsc(workflowId));
        return result;
    }

    public List<AgentDecisionLog> latestLogs() {
        return logRepository.findTop50ByOrderByCreateTimeDesc();
    }

    private AgentDecisionRequest normalizeRequest(AgentDecisionRequest request, EnvironmentRecord record) {
        AgentDecisionRequest normalized = request == null ? new AgentDecisionRequest() : request;
        normalized.setEnvironment(toDto(record));
        if (normalized.getCrop() == null || normalized.getCrop().isBlank()) {
            normalized.setCrop("tomato");
        }
        if (normalized.getGrowthStage() == null || normalized.getGrowthStage().isBlank()) {
            normalized.setGrowthStage("flowering");
        }
        if (normalized.getScenario() == null || normalized.getScenario().isBlank()) {
            normalized.setScenario("自动巡检");
        }
        return normalized;
    }

    private EnvironmentDataDTO toDto(EnvironmentRecord record) {
        EnvironmentDataDTO dto = new EnvironmentDataDTO();
        dto.setSoilTemperature(record.getSoilTemperature());
        dto.setSoilHumidity(record.getSoilHumidity());
        dto.setPhValue(record.getPhValue());
        dto.setEcValue(record.getEcValue());
        dto.setNutrient(record.getNutrient());
        dto.setAirTemperature(record.getAirTemperature());
        dto.setAirHumidity(record.getAirHumidity());
        dto.setLightIntensity(record.getLightIntensity());
        dto.setCo2(record.getCo2());
        dto.setWindSpeed(record.getWindSpeed());
        dto.setRainfall(record.getRainfall());
        dto.setPestCount(record.getPestCount());
        dto.setPestType(record.getPestType());
        return dto;
    }

    private void saveExpertLogs(String workflowId, AgentDecisionPlan plan, EnvironmentRecord record) {
        String input = "环境记录ID: " + record.getId()
                + ", 作物: " + plan.getCrop()
                + ", 阶段: " + plan.getGrowthStage()
                + ", 场景: " + plan.getScenario();
        for (AgentFinding finding : plan.getAgentFindings()) {
            saveLog(workflowId, finding.getAgentName(), "EXPERT_ANALYSIS", finding.getRiskLevel(),
                    input, finding.getConclusion(), null, finding);
        }
    }

    private List<AgentControlCommand> generateCommands(AgentDecisionPlan plan) {
        Set<String> unique = new LinkedHashSet<>();
        List<AgentControlCommand> commands = new ArrayList<>();
        for (String action : plan.getDeviceActions()) {
            if (contains(action, "灌溉", "滴灌", "微喷", "补水")) {
                addCommand(commands, unique, "IRR-001", "A区滴灌阀", action.contains("关闭") ? "STOP" : "START", action, plan.getOverallRiskLevel());
            }
            if (contains(action, "风机", "通风", "排湿")) {
                addCommand(commands, unique, "FAN-001", "A区通风风机", "START", action, plan.getOverallRiskLevel());
            }
            if (contains(action, "补光", "补光灯")) {
                addCommand(commands, unique, "LIGHT-001", "A区补光灯", "START", action, plan.getOverallRiskLevel());
            }
            if (contains(action, "卷帘", "遮阳")) {
                addCommand(commands, unique, "ROLLER-001", "A区卷帘机", "ADJUST", action, plan.getOverallRiskLevel());
            }
            if (contains(action, "加热", "保温")) {
                addCommand(commands, unique, "HEATER-001", "A区加热器", "START", action, plan.getOverallRiskLevel());
            }
        }
        return commands;
    }

    private void addCommand(List<AgentControlCommand> commands, Set<String> unique,
                            String code, String name, String action, String reason, String riskLevel) {
        String key = code + ":" + action;
        if (unique.add(key)) {
            commands.add(new AgentControlCommand(code, name, action, reason, riskLevel, true));
        }
    }

    private AgentSafetyReview reviewSafety(AgentDecisionPlan plan, List<AgentControlCommand> commands) {
        AgentSafetyReview review = new AgentSafetyReview();
        review.setRiskLevel(plan.getOverallRiskLevel());
        review.setApproved(true);
        review.setConclusion("安全审核通过：当前为虚拟设备执行，不接入真实硬件。");

        EnvironmentDataDTO env = plan.getEnvironment();
        for (AgentControlCommand command : commands) {
            if ("IRR-001".equals(command.getDeviceCode())
                    && "START".equals(command.getAction())
                    && env.getRainfall() != null
                    && env.getRainfall() > 20) {
                command.setApproved(false);
                review.getRejectedCommands().add("雨量较大，拒绝启动灌溉: " + command.getReason());
            }
            if ("LIGHT-001".equals(command.getDeviceCode())
                    && env.getLightIntensity() != null
                    && env.getLightIntensity() > 65000) {
                command.setApproved(false);
                review.getRejectedCommands().add("光照过强，拒绝补光: " + command.getReason());
            }
        }

        if (!review.getRejectedCommands().isEmpty()) {
            review.setConclusion("安全审核部分通过：高风险命令已拦截，其余命令允许虚拟执行。");
            review.getWarnings().add("被拦截命令不会写入虚拟设备执行结果，但会保留在 Agent 决策日志中。");
        }
        return review;
    }

    private List<AgentExecutionResult> executeVirtualDevices(String workflowId,
                                                            List<AgentControlCommand> commands,
                                                            AgentSafetyReview review) {
        List<AgentExecutionResult> results = new ArrayList<>();
        for (AgentControlCommand command : commands) {
            if (!command.isApproved()) {
                results.add(new AgentExecutionResult(command.getDeviceCode(), command.getAction(), "安全审核拦截，未执行", false));
                continue;
            }
            String result = "虚拟设备已执行 " + command.getAction() + "，原因：" + command.getReason();
            deviceService.logOperation(command.getDeviceCode(), "AGENT_" + command.getAction(), "multi-agent", result);
            results.add(new AgentExecutionResult(command.getDeviceCode(), command.getAction(), result, true));
        }
        saveLog(workflowId, "虚拟设备执行器", "VIRTUAL_DEVICE_EXECUTION", review.getRiskLevel(),
                "待执行命令数: " + commands.size(), "虚拟设备执行完成", review.isApproved(), results);
        return results;
    }

    private void saveLog(String workflowId, String agentName, String stage, String riskLevel,
                         String input, String output, Boolean safetyApproved, Object commands) {
        AgentDecisionLog log = new AgentDecisionLog();
        log.setWorkflowId(workflowId);
        log.setAgentName(agentName);
        log.setStage(stage);
        log.setRiskLevel(riskLevel);
        log.setInputSummary(cut(input, 1000));
        log.setOutputSummary(cut(output, 2000));
        log.setSafetyApproved(safetyApproved);
        log.setCommandsJson(toJson(commands));
        logRepository.save(log);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }

    private boolean contains(String source, String... keywords) {
        if (source == null) {
            return false;
        }
        for (String keyword : keywords) {
            if (source.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private String cut(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength);
    }
}

package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.agent.decision.AgentDecisionService;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionResponse;
import com.cby.smartfarm.service.AgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Agent 智能控制器
 * 提供 AI 辅助决策接口
 */
@RestController
@RequestMapping("/api/agent")
@RequiredArgsConstructor
@Tag(name = "AI 智能助手", description = "基于 AI 的智能分析和决策接口")
public class AgentController {

    private final AgentService agentService;
    private final AgentDecisionService agentDecisionService;

    @PostMapping("/analyze-environment")
    @Operation(summary = "智能环境分析", description = "分析环境数据并给出专业建议")
    public Result<Map<String, Object>> analyzeEnvironment(@RequestBody Map<String, Object> envData) {
        try {
            return Result.success(agentService.analyzeEnvironment(envData));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/decision")
    @Operation(summary = "Milvus RAG + 知识图谱多 Agent 智能决策")
    public Result<MilvusAgentDecisionResponse> decision(@RequestBody MilvusAgentDecisionRequest request) {
        return Result.success(agentDecisionService.decide(request));
    }

    @PostMapping("/diagnose-device")
    @Operation(summary = "智能设备诊断", description = "分析设备状态并给出维护建议")
    public Result<Map<String, Object>> diagnoseDevice(@RequestBody Map<String, Object> deviceData) {
        try {
            return Result.success(agentService.diagnoseDevice(deviceData));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/plan-tasks")
    @Operation(summary = "智能任务规划", description = "根据当前状态生成农事任务建议")
    public Result<Map<String, Object>> planTasks(@RequestBody Map<String, Object> context) {
        try {
            return Result.success(agentService.planTasks(context));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/ask")
    @Operation(summary = "智能问答", description = "回答农场管理相关问题")
    public Result<Map<String, Object>> askQuestion(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        if (question == null || question.trim().isEmpty()) {
            return Result.fail("问题不能为空");
        }
        try {
            return Result.success(agentService.askQuestion(question));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }

    @PostMapping("/analyze-alerts")
    @Operation(summary = "智能预警分析", description = "分析预警信息并给出处理建议")
    public Result<Map<String, Object>> analyzeAlerts(@RequestBody Map<String, Object> alertData) {
        try {
            return Result.success(agentService.analyzeAlerts(alertData));
        } catch (Exception e) {
            return Result.fail(e.getMessage());
        }
    }
}

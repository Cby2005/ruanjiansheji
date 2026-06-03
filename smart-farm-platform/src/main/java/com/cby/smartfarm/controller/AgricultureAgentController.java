package com.cby.smartfarm.controller;

import com.cby.smartfarm.agent.AgricultureDecisionService;
import com.cby.smartfarm.agent.dto.AgentDecisionPlan;
import com.cby.smartfarm.agent.dto.AgentDecisionRequest;
import com.cby.smartfarm.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
@Tag(name = "多智能体农业决策", description = "基于环境监测和场景描述生成农业解决方案")
public class AgricultureAgentController {

    private final AgricultureDecisionService agricultureDecisionService;

    @PostMapping("/decision")
    @Operation(summary = "根据环境数据和情景生成多智能体农业决策方案")
    public Result<AgentDecisionPlan> decide(@RequestBody AgentDecisionRequest request) {
        return Result.success(agricultureDecisionService.decide(request));
    }

    @GetMapping("/decision/latest")
    @Operation(summary = "使用最新环境监测数据生成多智能体农业决策方案")
    public Result<AgentDecisionPlan> decideLatest(
            @RequestParam(required = false) String crop,
            @RequestParam(required = false) String growthStage,
            @RequestParam(required = false) String scenario) {
        AgentDecisionRequest request = new AgentDecisionRequest();
        request.setCrop(crop);
        request.setGrowthStage(growthStage);
        request.setScenario(scenario);
        return Result.success(agricultureDecisionService.decide(request));
    }
}

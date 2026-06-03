package com.cby.smartfarm.agent.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "单个农业智能体的分析结果")
public class AgentFinding {

    @Schema(description = "智能体名称")
    private String agentName;

    @Schema(description = "智能体角色")
    private String role;

    @Schema(description = "风险等级：LOW/MEDIUM/HIGH")
    private String riskLevel;

    @Schema(description = "核心判断")
    private String conclusion;

    @Schema(description = "判断依据")
    private List<String> evidence = new ArrayList<>();

    @Schema(description = "解决方案建议")
    private List<String> recommendations = new ArrayList<>();

    @Schema(description = "建议设备动作")
    private List<String> deviceActions = new ArrayList<>();

    @Schema(description = "建议农事任务")
    private List<String> taskSuggestions = new ArrayList<>();
}

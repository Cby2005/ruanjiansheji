package com.cby.smartfarm.agent.dto;

import com.cby.smartfarm.dto.EnvironmentDataDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "多智能体农业决策方案")
public class AgentDecisionPlan {

    @Schema(description = "作物名称")
    private String crop;

    @Schema(description = "生长阶段")
    private String growthStage;

    @Schema(description = "情景描述")
    private String scenario;

    @Schema(description = "综合风险等级：LOW/MEDIUM/HIGH")
    private String overallRiskLevel;

    @Schema(description = "综合结论")
    private String summary;

    @Schema(description = "参与决策的环境数据")
    private EnvironmentDataDTO environment;

    @Schema(description = "各智能体分析结果")
    private List<AgentFinding> agentFindings = new ArrayList<>();

    @Schema(description = "立即执行建议")
    private List<String> immediateActions = new ArrayList<>();

    @Schema(description = "设备联动建议")
    private List<String> deviceActions = new ArrayList<>();

    @Schema(description = "农事任务建议")
    private List<String> taskSuggestions = new ArrayList<>();

    @Schema(description = "后续监测指标")
    private List<String> followUpMetrics = new ArrayList<>();
}

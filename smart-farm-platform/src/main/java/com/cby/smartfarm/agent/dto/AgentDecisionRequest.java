package com.cby.smartfarm.agent.dto;

import com.cby.smartfarm.dto.EnvironmentDataDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "多智能体农业决策请求")
public class AgentDecisionRequest {

    @Schema(description = "作物名称，例如 tomato、cucumber、rice")
    private String crop;

    @Schema(description = "生长阶段，例如 seedling、flowering、fruiting")
    private String growthStage;

    @Schema(description = "当前情景描述，例如 连续阴雨、虫害暴发、高温干旱")
    private String scenario;

    @Schema(description = "环境监测数据；为空时可使用最新采集数据")
    private EnvironmentDataDTO environment;
}

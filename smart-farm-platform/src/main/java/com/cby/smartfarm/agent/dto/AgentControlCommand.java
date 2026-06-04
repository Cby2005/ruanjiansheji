package com.cby.smartfarm.agent.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Agent 生成的虚拟设备控制命令")
public class AgentControlCommand {

    private String deviceCode;

    private String deviceName;

    private String action;

    private String reason;

    private String riskLevel;

    private boolean approved = true;
}

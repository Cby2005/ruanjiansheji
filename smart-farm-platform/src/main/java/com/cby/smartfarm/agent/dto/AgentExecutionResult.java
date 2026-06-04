package com.cby.smartfarm.agent.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "虚拟设备执行结果")
public class AgentExecutionResult {

    private String deviceCode;

    private String action;

    private String result;

    private boolean success;
}

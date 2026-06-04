package com.cby.smartfarm.agent.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "安全审核 Agent 结果")
public class AgentSafetyReview {

    private boolean approved;

    private String riskLevel;

    private String conclusion;

    private List<String> rejectedCommands = new ArrayList<>();

    private List<String> warnings = new ArrayList<>();
}

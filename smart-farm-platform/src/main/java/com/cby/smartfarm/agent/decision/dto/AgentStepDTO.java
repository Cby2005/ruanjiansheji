package com.cby.smartfarm.agent.decision.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AgentStepDTO {
    private String agentName;
    private String result;
}

package com.cby.smartfarm.agent.decision.dto;

import lombok.Data;

@Data
public class MilvusAgentDecisionRequest {
    private Long farmId;
    private String crop;
    private String region;
    private Double soilMoisture;
    private Double temperature;
    private Double humidity;
    private Double precipitation;
    private Double windSpeed;
    private String question;
}

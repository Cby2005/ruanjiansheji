package com.cby.smartfarm.weather.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class WeatherDecisionDTO {
    private Long farmId;
    private Double latitude;
    private Double longitude;
    private Double temperature;
    private Double humidity;
    private Double precipitation;
    private Double windSpeed;
    private Double soilTemperature;
    private Double soilMoisture;
    private Double next24hPrecipitation;
    private List<String> riskHints = new ArrayList<>();
    private String agentInputText;
    private String source;
}

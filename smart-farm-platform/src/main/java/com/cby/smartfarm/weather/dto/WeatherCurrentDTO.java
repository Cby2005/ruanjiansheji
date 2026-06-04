package com.cby.smartfarm.weather.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class WeatherCurrentDTO {
    private Long farmId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime recordTime;
    private Double temperature;
    private Double humidity;
    private Double precipitation;
    private Double windSpeed;
    private Double soilTemperature;
    private Double soilMoisture;
    private String source;
}

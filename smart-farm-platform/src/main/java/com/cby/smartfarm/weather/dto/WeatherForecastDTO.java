package com.cby.smartfarm.weather.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class WeatherForecastDTO {
    private Long farmId;
    private Double latitude;
    private Double longitude;
    private String source;
    private List<HourlyWeather> hourly = new ArrayList<>();

    @Data
    public static class HourlyWeather {
        private LocalDateTime time;
        private Double temperature;
        private Double humidity;
        private Double precipitation;
        private Double windSpeed;
        private Double soilTemperature;
        private Double soilMoisture;
    }
}

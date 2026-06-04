package com.cby.smartfarm.weather;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class OpenMeteoClient {

    private static final String CURRENT_FIELDS = "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm";
    private static final String HOURLY_FIELDS = "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_temperature_0cm,soil_moisture_0_to_1cm";

    private final WebClient.Builder webClientBuilder;

    @Value("${open-meteo.forecast-url}")
    private String forecastUrl;

    @Value("${open-meteo.archive-url}")
    private String archiveUrl;

    @Value("${open-meteo.timezone:Asia/Shanghai}")
    private String timezone;

    public JsonNode fetchCurrent(Double latitude, Double longitude) {
        return webClientBuilder.build()
                .get()
                .uri(forecastUrl, builder -> builder
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("current", CURRENT_FIELDS)
                        .queryParam("timezone", timezone)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode fetchForecast(Double latitude, Double longitude) {
        return webClientBuilder.build()
                .get()
                .uri(forecastUrl, builder -> builder
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("hourly", HOURLY_FIELDS)
                        .queryParam("forecast_days", 3)
                        .queryParam("timezone", timezone)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }

    public JsonNode fetchHistory(Double latitude, Double longitude, LocalDate start, LocalDate end) {
        return webClientBuilder.build()
                .get()
                .uri(archiveUrl, builder -> builder
                        .queryParam("latitude", latitude)
                        .queryParam("longitude", longitude)
                        .queryParam("start_date", start)
                        .queryParam("end_date", end)
                        .queryParam("hourly", HOURLY_FIELDS)
                        .queryParam("timezone", timezone)
                        .build())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .block();
    }
}

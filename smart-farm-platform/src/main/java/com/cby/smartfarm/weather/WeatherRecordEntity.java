package com.cby.smartfarm.weather;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "weather_record")
public class WeatherRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @Column(length = 50)
    private String source;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

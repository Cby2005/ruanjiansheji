package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "environment_record")
@Schema(description = "环境采集记录")
public class EnvironmentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "记录ID")
    private Long id;

    @Schema(description = "土壤温度(°C)")
    private Double soilTemperature;

    @Schema(description = "土壤湿度(%)")
    private Double soilHumidity;

    @Schema(description = "pH值")
    private Double phValue;

    @Schema(description = "EC值(mS/cm)")
    private Double ecValue;

    @Schema(description = "养分含量(mg/kg)")
    private Double nutrient;

    @Schema(description = "空气温度(°C)")
    private Double airTemperature;

    @Schema(description = "空气湿度(%)")
    private Double airHumidity;

    @Schema(description = "光照强度(lux)")
    private Double lightIntensity;

    @Schema(description = "CO₂浓度(ppm)")
    private Double co2;

    @Schema(description = "风速(m/s)")
    private Double windSpeed;

    @Schema(description = "降雨量(mm)")
    private Double rainfall;

    @Schema(description = "虫情数量(头)")
    private Integer pestCount;

    @Column(length = 100)
    @Schema(description = "害虫类型")
    private String pestType;

    @Column(name = "collect_time")
    @Schema(description = "采集时间")
    private LocalDateTime collectTime;

    @PrePersist
    public void prePersist() {
        if (this.collectTime == null) {
            this.collectTime = LocalDateTime.now();
        }
    }
}

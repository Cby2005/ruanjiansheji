package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "environment_threshold")
@Schema(description = "环境阈值配置")
public class EnvironmentThreshold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "metric_code", nullable = false, unique = true, length = 50)
    @Schema(description = "指标编码，例如 soilHumidity、airTemperature")
    private String metricCode;

    @Column(name = "metric_name", nullable = false, length = 100)
    @Schema(description = "指标名称")
    private String metricName;

    @Column(name = "min_value")
    @Schema(description = "最低阈值")
    private Double minValue;

    @Column(name = "max_value")
    @Schema(description = "最高阈值")
    private Double maxValue;

    @Column(length = 20)
    @Schema(description = "默认预警等级：INFO/WARNING/ERROR/CRITICAL")
    private String level = "WARNING";

    @Column(length = 500)
    @Schema(description = "处理建议")
    private String suggestion;

    @Column(nullable = false)
    @Schema(description = "是否启用")
    private Boolean enabled = true;

    @Column(name = "update_time")
    private LocalDateTime updateTime;

    @PrePersist
    @PreUpdate
    public void touch() {
        this.updateTime = LocalDateTime.now();
    }
}

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
@Table(name = "yield_prediction")
@Schema(description = "产量预测记录")
public class YieldPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "预测ID")
    private Long id;

    @Column(name = "crop_name", nullable = false, length = 50)
    @Schema(description = "作物名称")
    private String cropName;

    @Column(name = "base_yield")
    @Schema(description = "基础产量(kg)")
    private Double baseYield;

    @Column(name = "env_score")
    @Schema(description = "环境评分(0-100)")
    private Double envScore;

    @Column(name = "task_score")
    @Schema(description = "任务评分(0-100)")
    private Double taskScore;

    @Column(name = "device_score")
    @Schema(description = "设备评分(0-100)")
    private Double deviceScore;

    @Column(name = "predicted_yield")
    @Schema(description = "预测产量(kg)")
    private Double predictedYield;

    @Column(name = "create_time")
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @PrePersist
    public void prePersist() {
        if (this.createTime == null) {
            this.createTime = LocalDateTime.now();
        }
    }
}

package com.smartfarm.entity;

import com.smartfarm.entity.enums.SensorType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sensor_data", indexes = {
    @Index(name = "idx_sensor_zone", columnList = "zone_id"),
    @Index(name = "idx_sensor_time", columnList = "recorded_at")
})
@Schema(description = "传感器数据记录")
public class SensorData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "记录ID")
    private Long id;

    @Column(name = "zone_id", nullable = false)
    @Schema(description = "所属区域ID")
    private Long zoneId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sensor_type", nullable = false, length = 30)
    @Schema(description = "传感器类型")
    private SensorType sensorType;

    @Column(name = "data_value", nullable = false)
    @Schema(description = "采集值")
    private Double value;

    @Column(length = 20)
    @Schema(description = "单位")
    private String unit;

    @Column(name = "recorded_at", nullable = false)
    @Schema(description = "采集时间")
    private LocalDateTime recordedAt;

    @PrePersist
    public void prePersist() {
        if (this.recordedAt == null) {
            this.recordedAt = LocalDateTime.now();
        }
        if (this.unit == null && this.sensorType != null) {
            this.unit = this.sensorType.getUnit();
        }
    }
}

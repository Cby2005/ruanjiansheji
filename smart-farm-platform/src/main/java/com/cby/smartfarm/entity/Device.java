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
@Table(name = "device")
@Schema(description = "设备信息")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "设备ID")
    private Long id;

    @Column(name = "device_code", nullable = false, unique = true, length = 50)
    @Schema(description = "设备编号")
    private String deviceCode;

    @Column(name = "device_name", nullable = false, length = 100)
    @Schema(description = "设备名称")
    private String deviceName;

    @Column(name = "device_type", nullable = false, length = 30)
    @Schema(description = "设备类型：IRRIGATION/LIGHT/FAN/ROLLER/HEATER")
    private String deviceType;

    @Column(length = 50)
    @Schema(description = "区域")
    private String area;

    @Column(nullable = false, length = 20)
    @Schema(description = "状态：STANDBY/RUNNING/FAULT/MAINTENANCE/CALIBRATION")
    private String state = "STANDBY";

    @Schema(description = "是否在线")
    private Boolean online = true;

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

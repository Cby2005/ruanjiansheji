package com.smartfarm.entity;

import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.entity.enums.DeviceType;
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
@Table(name = "device")
@Schema(description = "设备信息")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "设备ID")
    private Long id;

    @Column(nullable = false, length = 100)
    @Schema(description = "设备名称")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "device_type", nullable = false, length = 30)
    @Schema(description = "设备类型")
    private DeviceType deviceType;

    @Column(name = "zone_id")
    @Schema(description = "所属区域ID")
    private Long zoneId;

    @Enumerated(EnumType.STRING)
    @Column(name = "state", nullable = false, length = 20)
    @Schema(description = "设备状态")
    private DeviceStateType state = DeviceStateType.IDLE;

    @Column(name = "is_online")
    @Schema(description = "是否在线")
    private Boolean isOnline = true;

    @Column(name = "power_consumption")
    @Schema(description = "额定功率(W)")
    private Double powerConsumption;

    @Column(name = "total_running_minutes")
    @Schema(description = "累计运行时长(分钟)")
    private Long totalRunningMinutes = 0L;

    @Column(name = "last_started_at")
    @Schema(description = "上次启动时间")
    private LocalDateTime lastStartedAt;

    @Column(name = "created_at")
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

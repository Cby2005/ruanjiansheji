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
@Table(name = "device_operation_log")
@Schema(description = "设备操作日志")
public class DeviceOperationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "日志ID")
    private Long id;

    @Column(name = "device_code", length = 50)
    @Schema(description = "设备编号")
    private String deviceCode;

    @Column(name = "device_name", length = 100)
    @Schema(description = "设备名称")
    private String deviceName;

    @Column(length = 100)
    @Schema(description = "操作动作")
    private String action;

    @Column(length = 100)
    @Schema(description = "操作人")
    private String operator;

    @Column(length = 20)
    @Schema(description = "执行结果：SUCCESS/FAILED")
    private String result;

    @Column(name = "operation_time")
    @Schema(description = "操作时间")
    private LocalDateTime operationTime;

    @PrePersist
    public void prePersist() {
        if (this.operationTime == null) {
            this.operationTime = LocalDateTime.now();
        }
    }
}

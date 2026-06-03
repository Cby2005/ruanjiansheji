package com.smartfarm.entity;

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
@Table(name = "device_command_log")
@Schema(description = "设备指令日志")
public class DeviceCommandLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "日志ID")
    private Long id;

    @Column(name = "device_id", nullable = false)
    @Schema(description = "设备ID")
    private Long deviceId;

    @Column(name = "command_name", nullable = false, length = 100)
    @Schema(description = "指令名称")
    private String commandName;

    @Column(length = 500)
    @Schema(description = "指令参数(JSON)")
    private String parameters;

    @Column(nullable = false, length = 20)
    @Schema(description = "执行结果(SUCCESS/FAILED)")
    private String result;

    @Column(length = 500)
    @Schema(description = "执行反馈")
    private String feedback;

    @Column(name = "executed_at", nullable = false)
    @Schema(description = "执行时间")
    private LocalDateTime executedAt;

    @Column(name = "duration_ms")
    @Schema(description = "执行耗时(ms)")
    private Long durationMs;

    @PrePersist
    public void prePersist() {
        if (this.executedAt == null) {
            this.executedAt = LocalDateTime.now();
        }
    }
}

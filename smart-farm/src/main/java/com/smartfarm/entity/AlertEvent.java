package com.smartfarm.entity;

import com.smartfarm.entity.enums.AlertLevel;
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
@Table(name = "alert_event", indexes = {
    @Index(name = "idx_alert_level", columnList = "level"),
    @Index(name = "idx_alert_time", columnList = "created_at")
})
@Schema(description = "报警事件")
public class AlertEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "事件ID")
    private Long id;

    @Column(name = "zone_id")
    @Schema(description = "关联区域ID")
    private Long zoneId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Schema(description = "报警级别")
    private AlertLevel level;

    @Column(nullable = false, length = 200)
    @Schema(description = "报警标题")
    private String title;

    @Column(length = 1000)
    @Schema(description = "报警详情")
    private String detail;

    @Column(name = "is_handled")
    @Schema(description = "是否已处理")
    private Boolean isHandled = false;

    @Column(name = "handled_by", length = 100)
    @Schema(description = "处理人")
    private String handledBy;

    @Column(name = "handled_at")
    @Schema(description = "处理时间")
    private LocalDateTime handledAt;

    @Column(name = "created_at")
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}

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
@Table(name = "alert_record")
@Schema(description = "预警记录")
public class AlertRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "预警ID")
    private Long id;

    @Column(name = "alert_type", length = 50)
    @Schema(description = "预警类型")
    private String alertType;

    @Column(name = "alert_level", length = 20)
    @Schema(description = "预警级别：INFO/WARNING/ERROR/CRITICAL")
    private String alertLevel;

    @Column(length = 500)
    @Schema(description = "预警信息")
    private String message;

    @Schema(description = "是否已处理")
    private Boolean handled = false;

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

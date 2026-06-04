package com.agriculture.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "device")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String type; // sensor / actuator

    @Column(length = 50)
    private String subType; // soil / light / weather / pest / irrigation / fan / light_actuator / roller / heater

    @Column(length = 50)
    private String location;

    @Column(nullable = false)
    private Integer onlineStatus = 0; // 1-在线 0-离线

    @Column(nullable = false, length = 20)
    private String state = "STANDBY"; // STANDBY / RUNNING / FAULT / MAINTENANCE / CALIBRATION

    private Double currentValue;

    @Column(length = 20)
    private String unit;

    private LocalDateTime lastHeartbeat;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @PrePersist
    public void prePersist() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updateTime = LocalDateTime.now();
    }
}

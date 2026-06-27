package com.cby.smartfarm.drone;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "drone_inspection_task")
public class DroneInspectionTask extends DroneBaseEntity {
    @Column(nullable = false, unique = true, length = 50)
    private String taskCode;
    @Column(nullable = false, length = 100)
    private String taskName;
    private Long droneId;
    private Long routeId;
    private Long greenhouseId;
    private String taskType;
    private String taskStatus = "PENDING";
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    @Lob
    private String result;
    private String remark;
}

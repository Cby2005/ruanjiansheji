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
@Table(name = "drone_inspection_report")
public class DroneInspectionReport extends DroneBaseEntity {
    @Column(nullable = false, unique = true)
    private Long taskId;
    private String taskName;
    private String droneName;
    private String routeName;
    private String inspectionArea;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer totalImages;
    private Integer abnormalImages;
    @Lob
    private String diseaseTypes;
    @Lob
    private String suggestion;
    private LocalDateTime reportTime;
}

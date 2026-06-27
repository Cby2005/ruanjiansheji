package com.cby.smartfarm.drone;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "drone_inspection_image")
public class DroneInspectionImage extends DroneBaseEntity {
    @Column(nullable = false)
    private Long taskId;
    @Column(nullable = false, length = 500)
    private String imageUrl;
    private String capturePoint;
    private String detectResult = "PENDING";
    private String diseaseType;
    private Double confidence;
    @Lob
    private String suggestion;
}

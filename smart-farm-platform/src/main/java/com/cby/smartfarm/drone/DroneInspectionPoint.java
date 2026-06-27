package com.cby.smartfarm.drone;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "drone_inspection_point")
public class DroneInspectionPoint extends DroneBaseEntity {
    @Column(nullable = false, length = 100)
    private String pointName;
    private Long greenhouseId;
    private String areaName;
    @Column(nullable = false)
    private Double x;
    @Column(nullable = false)
    private Double y;
    @Column(nullable = false)
    private Double z;
    @Column(columnDefinition = "DECIMAL(12,6)")
    private Double longitude;
    @Column(columnDefinition = "DECIMAL(12,6)")
    private Double latitude;
    @Column(columnDefinition = "DECIMAL(8,2)")
    private Double altitude = 1.5D;
    private String pointType = "NORMAL";
    private String remark;
}

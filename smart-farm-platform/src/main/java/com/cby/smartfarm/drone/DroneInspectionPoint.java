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
    private String pointType = "NORMAL";
    private String remark;
}

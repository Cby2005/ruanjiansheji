package com.cby.smartfarm.drone;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "drone_device")
public class DroneDevice extends DroneBaseEntity {
    @Column(nullable = false, unique = true, length = 50)
    private String droneCode;
    @Column(nullable = false, length = 100)
    private String droneName;
    private String model;
    private Integer batteryLevel = 100;
    private String status = "IDLE";
    private String cameraStatus = "NORMAL";
    @Column(name = "current_x")
    private Double currentX = 0D;
    @Column(name = "current_y")
    private Double currentY = 0D;
    @Column(name = "current_z")
    private Double currentZ = 0D;
    private Long greenhouseId;
    private String remark;
}

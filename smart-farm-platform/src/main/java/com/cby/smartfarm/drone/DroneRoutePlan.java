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
@Table(name = "drone_route_plan")
public class DroneRoutePlan extends DroneBaseEntity {
    @Column(nullable = false, unique = true, length = 50)
    private String routeCode;
    @Column(nullable = false, length = 100)
    private String routeName;
    private Long greenhouseId;
    private String routeType;
    private String startPoint;
    private String endPoint;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String waypoints;
    private Double flightHeight;
    private Double estimatedTime;
    private Double totalDistance;
    private String status = "READY";
}

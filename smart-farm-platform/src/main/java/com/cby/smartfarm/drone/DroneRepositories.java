package com.cby.smartfarm.drone;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

interface DroneDeviceRepository extends JpaRepository<DroneDevice, Long> {
    boolean existsByDroneCode(String droneCode);
}

interface DroneInspectionPointRepository extends JpaRepository<DroneInspectionPoint, Long> {}

interface DroneRoutePlanRepository extends JpaRepository<DroneRoutePlan, Long> {}

interface DroneInspectionTaskRepository extends JpaRepository<DroneInspectionTask, Long> {}

interface DroneInspectionImageRepository extends JpaRepository<DroneInspectionImage, Long> {
    List<DroneInspectionImage> findByTaskId(Long taskId);
}

interface DroneInspectionReportRepository extends JpaRepository<DroneInspectionReport, Long> {
    Optional<DroneInspectionReport> findByTaskId(Long taskId);
}

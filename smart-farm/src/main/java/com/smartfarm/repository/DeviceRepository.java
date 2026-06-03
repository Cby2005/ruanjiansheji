package com.smartfarm.repository;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.entity.enums.DeviceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findByZoneId(Long zoneId);
    List<Device> findByDeviceType(DeviceType deviceType);
    List<Device> findByState(DeviceStateType state);
    List<Device> findByZoneIdAndDeviceType(Long zoneId, DeviceType deviceType);
    List<Device> findByIsOnlineTrue();
}

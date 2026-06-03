package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    Optional<Device> findByDeviceCode(String deviceCode);

    List<Device> findByDeviceType(String deviceType);

    List<Device> findByState(String state);
}

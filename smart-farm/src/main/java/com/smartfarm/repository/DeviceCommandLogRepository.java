package com.smartfarm.repository;

import com.smartfarm.entity.DeviceCommandLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceCommandLogRepository extends JpaRepository<DeviceCommandLog, Long> {
    List<DeviceCommandLog> findByDeviceId(Long deviceId);
    Page<DeviceCommandLog> findByDeviceId(Long deviceId, Pageable pageable);
}

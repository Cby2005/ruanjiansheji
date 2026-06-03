package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.DeviceOperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceOperationLogRepository extends JpaRepository<DeviceOperationLog, Long> {

    List<DeviceOperationLog> findByDeviceCodeOrderByOperationTimeDesc(String deviceCode);
}

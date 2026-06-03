package com.smartfarm.repository;

import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.SensorType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    List<SensorData> findByZoneIdAndSensorType(Long zoneId, SensorType sensorType);

    @Query("SELECT s FROM SensorData s WHERE s.zoneId = :zoneId AND s.sensorType = :sensorType ORDER BY s.recordedAt DESC")
    List<SensorData> findLatestByZoneAndType(@Param("zoneId") Long zoneId,
                                              @Param("sensorType") SensorType sensorType,
                                              Pageable pageable);

    @Query("SELECT s FROM SensorData s WHERE s.zoneId = :zoneId AND s.recordedAt BETWEEN :start AND :end ORDER BY s.recordedAt DESC")
    List<SensorData> findByZoneIdAndTimeRange(@Param("zoneId") Long zoneId,
                                               @Param("start") LocalDateTime start,
                                               @Param("end") LocalDateTime end);

    default Optional<SensorData> findLatest(Long zoneId, SensorType sensorType) {
        List<SensorData> list = findLatestByZoneAndType(zoneId, sensorType, Pageable.ofSize(1));
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }
}

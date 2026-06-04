package com.cby.smartfarm.weather;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WeatherRecordMapper extends JpaRepository<WeatherRecordEntity, Long> {

    List<WeatherRecordEntity> findByFarmIdAndRecordTimeBetweenOrderByRecordTimeAsc(
            Long farmId,
            LocalDateTime start,
            LocalDateTime end);

    List<WeatherRecordEntity> findTop24ByFarmIdOrderByRecordTimeDesc(Long farmId);
}

package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.EnvironmentThreshold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnvironmentThresholdRepository extends JpaRepository<EnvironmentThreshold, Long> {

    Optional<EnvironmentThreshold> findByMetricCode(String metricCode);

    boolean existsByMetricCode(String metricCode);

    List<EnvironmentThreshold> findByEnabledTrue();
}

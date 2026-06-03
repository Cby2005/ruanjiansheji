package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.YieldPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface YieldPredictionRepository extends JpaRepository<YieldPrediction, Long> {
}

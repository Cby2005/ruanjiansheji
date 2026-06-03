package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.CropRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CropRecommendationRepository extends JpaRepository<CropRecommendation, Long> {
    List<CropRecommendation> findByLabel(String label);
    List<CropRecommendation> findByTemperatureBetweenAndHumidityBetween(Double tempMin, Double tempMax, Double humMin, Double humMax);
}

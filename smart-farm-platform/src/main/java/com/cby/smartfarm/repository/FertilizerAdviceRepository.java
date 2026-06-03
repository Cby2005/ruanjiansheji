package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.FertilizerAdvice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FertilizerAdviceRepository extends JpaRepository<FertilizerAdvice, Long> {
    List<FertilizerAdvice> findByCrop(String crop);
    List<FertilizerAdvice> findByCropAndPhBetween(String crop, Double phMin, Double phMax);
}

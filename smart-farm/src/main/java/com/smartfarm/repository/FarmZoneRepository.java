package com.smartfarm.repository;

import com.smartfarm.entity.FarmZone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmZoneRepository extends JpaRepository<FarmZone, Long> {
    List<FarmZone> findByIsActiveTrue();
    List<FarmZone> findByType(String type);
}

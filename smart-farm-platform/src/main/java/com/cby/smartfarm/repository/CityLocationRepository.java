package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.CityLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityLocationRepository extends JpaRepository<CityLocation, Long> {
    List<CityLocation> findByProvince(String province);
    Optional<CityLocation> findByCityName(String cityName);
}

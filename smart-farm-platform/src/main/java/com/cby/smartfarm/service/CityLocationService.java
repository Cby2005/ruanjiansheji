package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.CityLocation;
import com.cby.smartfarm.repository.CityLocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CityLocationService {

    private final CityLocationRepository cityLocationRepository;

    public List<String> getProvinces() {
        return cityLocationRepository.findAll().stream()
                .map(CityLocation::getProvince)
                .distinct()
                .collect(Collectors.toList());
    }

    public List<String> getCitiesByProvince(String province) {
        return cityLocationRepository.findByProvince(province).stream()
                .map(CityLocation::getCityName)
                .collect(Collectors.toList());
    }

    public Optional<CityLocation> findByName(String cityName) {
        return cityLocationRepository.findByCityName(cityName);
    }
}

package com.smartfarm.service;

import com.smartfarm.entity.FarmZone;
import com.smartfarm.repository.FarmZoneRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
public class FarmZoneService {

    @Autowired
    private FarmZoneRepository farmZoneRepository;

    public List<FarmZone> findAll() {
        return farmZoneRepository.findAll();
    }

    public FarmZone findById(Long id) {
        return farmZoneRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("区域不存在: " + id));
    }

    public List<FarmZone> findActive() {
        return farmZoneRepository.findByIsActiveTrue();
    }

    @Transactional
    public FarmZone create(FarmZone zone) {
        zone.setId(null);
        return farmZoneRepository.save(zone);
    }

    @Transactional
    public FarmZone update(Long id, FarmZone zone) {
        FarmZone existing = findById(id);
        existing.setName(zone.getName());
        existing.setType(zone.getType());
        existing.setDescription(zone.getDescription());
        existing.setAreaSize(zone.getAreaSize());
        existing.setIsActive(zone.getIsActive());
        return farmZoneRepository.save(existing);
    }

    @Transactional
    public void delete(Long id) {
        farmZoneRepository.deleteById(id);
    }
}

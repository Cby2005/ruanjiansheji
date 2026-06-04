package com.cby.smartfarm.service;

import com.cby.smartfarm.design.factory.sensor.Sensor;
import com.cby.smartfarm.design.factory.sensor.SensorFactory;
import com.cby.smartfarm.design.observer.EnvironmentDataCenter;
import com.cby.smartfarm.design.observer.impl.FanObserver;
import com.cby.smartfarm.design.observer.impl.IrrigationObserver;
import com.cby.smartfarm.design.observer.impl.LightObserver;
import com.cby.smartfarm.design.observer.impl.PestWarningObserver;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.EnvironmentRecordRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class EnvironmentService {

    private final EnvironmentRecordRepository environmentRecordRepository;
    private final EnvironmentDataCenter dataCenter;
    private final EnvironmentAlertService environmentAlertService;
    private final IrrigationObserver irrigationObserver;
    private final LightObserver lightObserver;
    private final FanObserver fanObserver;
    private final PestWarningObserver pestWarningObserver;

    public EnvironmentService(EnvironmentRecordRepository environmentRecordRepository,
                              EnvironmentDataCenter dataCenter,
                              EnvironmentAlertService environmentAlertService,
                              IrrigationObserver irrigationObserver,
                              LightObserver lightObserver,
                              FanObserver fanObserver,
                              PestWarningObserver pestWarningObserver) {
        this.environmentRecordRepository = environmentRecordRepository;
        this.dataCenter = dataCenter;
        this.environmentAlertService = environmentAlertService;
        this.irrigationObserver = irrigationObserver;
        this.lightObserver = lightObserver;
        this.fanObserver = fanObserver;
        this.pestWarningObserver = pestWarningObserver;
    }

    @PostConstruct
    public void initObservers() {
        dataCenter.registerObserver(irrigationObserver);
        dataCenter.registerObserver(lightObserver);
        dataCenter.registerObserver(fanObserver);
        dataCenter.registerObserver(pestWarningObserver);
        log.info("[Observer] registered {} environment observers", dataCenter.getObservers().size());
    }

    @Transactional
    public EnvironmentRecord collect() {
        EnvironmentRecord saved = environmentRecordRepository.save(buildRecord());
        environmentAlertService.evaluateAndSave(saved);
        log.info("Environment data collected, id={}", saved.getId());
        return saved;
    }

    @Transactional
    public Map<String, Object> collectAndControl() {
        EnvironmentRecord saved = environmentRecordRepository.save(buildRecord());
        List<AlertRecord> alerts = environmentAlertService.evaluateAndSave(saved);
        List<String> triggeredActions = dataCenter.notifyObservers(saved);

        Map<String, Object> result = new HashMap<>();
        result.put("environmentRecord", saved);
        result.put("alerts", alerts);
        result.put("autoControlActions", triggeredActions);
        result.put("triggeredObserverCount", triggeredActions.size());
        return result;
    }

    private EnvironmentRecord buildRecord() {
        Sensor soilSensor = SensorFactory.createSensor("soil");
        Sensor lightSensor = SensorFactory.createSensor("light");
        Sensor weatherSensor = SensorFactory.createSensor("weather");
        Sensor pestSensor = SensorFactory.createSensor("pest");

        EnvironmentDataDTO soil = soilSensor.collect();
        EnvironmentDataDTO light = lightSensor.collect();
        EnvironmentDataDTO weather = weatherSensor.collect();
        EnvironmentDataDTO pest = pestSensor.collect();

        EnvironmentRecord record = new EnvironmentRecord();
        record.setSoilTemperature(soil.getSoilTemperature());
        record.setSoilHumidity(soil.getSoilHumidity());
        record.setPhValue(soil.getPhValue());
        record.setEcValue(soil.getEcValue());
        record.setNutrient(soil.getNutrient());
        record.setLightIntensity(light.getLightIntensity());
        record.setAirTemperature(weather.getAirTemperature());
        record.setAirHumidity(weather.getAirHumidity());
        record.setCo2(weather.getCo2());
        record.setWindSpeed(weather.getWindSpeed());
        record.setRainfall(weather.getRainfall());
        record.setPestCount(pest.getPestCount());
        record.setPestType(pest.getPestType());
        return record;
    }

    public Optional<EnvironmentRecord> getLatest() {
        return environmentRecordRepository.findTopByOrderByCollectTimeDesc();
    }

    public List<EnvironmentRecord> listAll() {
        return environmentRecordRepository.findAll();
    }
}

package com.smartfarm.service;

import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;
import com.smartfarm.pattern.factory.SensorFactory;
import com.smartfarm.pattern.observer.DataSubject;
import com.smartfarm.pattern.singleton.LoggerManager;
import com.smartfarm.repository.SensorDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class SensorService {

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private SensorFactory sensorFactory;

    @Autowired
    private DataSubject dataSubject;

    public List<SensorData> findByZoneAndType(Long zoneId, SensorType sensorType) {
        return sensorDataRepository.findByZoneIdAndSensorType(zoneId, sensorType);
    }

    public Optional<SensorData> getLatest(Long zoneId, SensorType sensorType) {
        return sensorDataRepository.findLatest(zoneId, sensorType);
    }

    public List<SensorData> getHistory(Long zoneId, SensorType sensorType, int limit) {
        return sensorDataRepository.findLatestByZoneAndType(zoneId, sensorType, PageRequest.of(0, limit));
    }

    public List<SensorData> getByTimeRange(Long zoneId, LocalDateTime start, LocalDateTime end) {
        return sensorDataRepository.findByZoneIdAndTimeRange(zoneId, start, end);
    }

    public SensorData collectAndSave(Long zoneId, SensorType sensorType) {
        Sensor sensor = sensorFactory.createSensor(sensorType);
        double value = sensor.read();

        SensorData data = new SensorData();
        data.setZoneId(zoneId);
        data.setSensorType(sensorType);
        data.setValue(value);
        data.setUnit(sensor.getUnit());
        data.setRecordedAt(LocalDateTime.now());

        SensorData saved = sensorDataRepository.save(data);
        dataSubject.notifyObservers(saved);
        return saved;
    }

    @Scheduled(initialDelay = 10000, fixedRate = 30000)
    public void simulateDataCollection() {
        List<Long> zoneIds = Arrays.asList(1L, 2L, 3L);
        SensorType[] types = {SensorType.TEMPERATURE, SensorType.HUMIDITY,
                SensorType.SOIL_MOISTURE, SensorType.LIGHT_INTENSITY, SensorType.CO2};

        for (Long zoneId : zoneIds) {
            for (SensorType type : types) {
                try {
                    collectAndSave(zoneId, type);
                } catch (Exception e) {
                    log.error("模拟采集失败: 区域{}, 类型{}", zoneId, type, e);
                }
            }
        }
        log.debug("定时模拟数据采集完成");
    }
}

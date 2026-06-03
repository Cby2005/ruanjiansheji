package com.cby.smartfarm.service;

import com.cby.smartfarm.design.factory.sensor.SensorFactory;
import com.cby.smartfarm.design.factory.sensor.Sensor;
import com.cby.smartfarm.design.observer.EnvironmentDataCenter;
import com.cby.smartfarm.design.observer.impl.FanObserver;
import com.cby.smartfarm.design.observer.impl.IrrigationObserver;
import com.cby.smartfarm.design.observer.impl.LightObserver;
import com.cby.smartfarm.design.observer.impl.PestWarningObserver;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.EnvironmentRecordRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
public class EnvironmentService {

    private final EnvironmentRecordRepository environmentRecordRepository;
    private final EnvironmentDataCenter dataCenter;
    private final IrrigationObserver irrigationObserver;
    private final LightObserver lightObserver;
    private final FanObserver fanObserver;
    private final PestWarningObserver pestWarningObserver;

    public EnvironmentService(EnvironmentRecordRepository environmentRecordRepository,
                              EnvironmentDataCenter dataCenter,
                              IrrigationObserver irrigationObserver,
                              LightObserver lightObserver,
                              FanObserver fanObserver,
                              PestWarningObserver pestWarningObserver) {
        this.environmentRecordRepository = environmentRecordRepository;
        this.dataCenter = dataCenter;
        this.irrigationObserver = irrigationObserver;
        this.lightObserver = lightObserver;
        this.fanObserver = fanObserver;
        this.pestWarningObserver = pestWarningObserver;
    }

    /**
     * 【观察者模式】系统启动时自动注册所有观察者到 EnvironmentDataCenter
     */
    @PostConstruct
    public void initObservers() {
        dataCenter.registerObserver(irrigationObserver);
        dataCenter.registerObserver(lightObserver);
        dataCenter.registerObserver(fanObserver);
        dataCenter.registerObserver(pestWarningObserver);
        log.info("【观察者模式】所有观察者已注册完毕，共 {} 个", dataCenter.getObservers().size());
    }

    /**
     * 采集环境数据（原有接口，仅保存不触发控制）
     */
    @Transactional
    public EnvironmentRecord collect() {
        EnvironmentRecord record = buildRecord();
        EnvironmentRecord saved = environmentRecordRepository.save(record);
        log.info("环境数据采集完成，ID: {}", saved.getId());
        return saved;
    }

    /**
     * 【观察者模式】采集环境数据 + 自动控制
     * 流程：
     * 1. 采集环境数据并保存
     * 2. 将数据交给 EnvironmentDataCenter（被观察者）
     * 3. EnvironmentDataCenter 通知所有观察者
     * 4. 观察者根据阈值自动触发设备控制
     * 5. 自动控制结果写入 device_operation_log
     */
    @Transactional
    public Map<String, Object> collectAndControl() {
        // 第一步：采集并保存环境数据
        EnvironmentRecord record = buildRecord();
        EnvironmentRecord saved = environmentRecordRepository.save(record);
        log.info("【观察者模式】环境数据采集完成，ID: {}", saved.getId());

        // 第二步 & 第三步：将数据交给被观察者，由被观察者通知所有观察者
        // Controller 不直接判断阈值，判断逻辑完全在各个观察者内部
        List<String> triggeredActions = dataCenter.notifyObservers(saved);

        // 组装返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("环境数据", saved);
        result.put("自动控制动作", triggeredActions);
        result.put("触发观察者数量", triggeredActions.size());
        return result;
    }

    /**
     * 通过工厂方法模式创建4种传感器并合并数据
     */
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

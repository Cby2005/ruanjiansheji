package com.smartfarm.pattern.observer.impl;

import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.observer.DataObserver;
import com.smartfarm.pattern.strategy.ControlStrategy;
import com.smartfarm.pattern.strategy.impl.IrrigationStrategy;
import com.smartfarm.pattern.strategy.impl.LightCompensationStrategy;
import com.smartfarm.pattern.strategy.impl.VentilationStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.EnumMap;
import java.util.Map;

@Slf4j
@Component
public class AutoControlDataObserver implements DataObserver {

    @Autowired
    private IrrigationStrategy irrigationStrategy;

    @Autowired
    private LightCompensationStrategy lightStrategy;

    @Autowired
    private VentilationStrategy ventilationStrategy;

    private final Map<SensorType, ControlStrategy> strategyMap = new EnumMap<>(SensorType.class);

    @PostConstruct
    public void init() {
        strategyMap.put(SensorType.SOIL_MOISTURE, irrigationStrategy);
        strategyMap.put(SensorType.LIGHT_INTENSITY, lightStrategy);
        strategyMap.put(SensorType.TEMPERATURE, ventilationStrategy);
        strategyMap.put(SensorType.HUMIDITY, ventilationStrategy);
    }

    @Override
    public void onDataChanged(SensorData data) {
        ControlStrategy strategy = strategyMap.get(data.getSensorType());
        if (strategy != null) {
            log.debug("自动控制触发: {} -> {}", data.getSensorType(), strategy.getStrategyName());
            strategy.evaluate(data);
        }
    }

    @Override
    public String getObserverName() {
        return "AutoControlDataObserver";
    }
}

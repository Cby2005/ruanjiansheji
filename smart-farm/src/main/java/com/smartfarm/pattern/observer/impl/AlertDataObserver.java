package com.smartfarm.pattern.observer.impl;

import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.observer.DataObserver;
import com.smartfarm.pattern.chain.AlertHandlerChain;
import com.smartfarm.pattern.singleton.LoggerManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.EnumMap;
import java.util.Map;

@Slf4j
@Component
public class AlertDataObserver implements DataObserver {

    private static final Map<SensorType, double[]> THRESHOLD_MAP = new EnumMap<>(SensorType.class);

    static {
        THRESHOLD_MAP.put(SensorType.TEMPERATURE, new double[]{5.0, 10.0, 35.0, 40.0});
        THRESHOLD_MAP.put(SensorType.HUMIDITY, new double[]{20.0, 30.0, 85.0, 95.0});
        THRESHOLD_MAP.put(SensorType.SOIL_MOISTURE, new double[]{15.0, 25.0, 75.0, 90.0});
        THRESHOLD_MAP.put(SensorType.CO2, new double[]{0, 400.0, 1500.0, 2000.0});
        THRESHOLD_MAP.put(SensorType.PH, new double[]{4.5, 5.5, 8.0, 9.0});
    }

    @Autowired
    private AlertHandlerChain alertHandlerChain;

    @PostConstruct
    public void init() {
        LoggerManager.getInstance().info("AlertDataObserver 初始化完成");
    }

    @Override
    public void onDataChanged(SensorData data) {
        double[] thresholds = THRESHOLD_MAP.get(data.getSensorType());
        if (thresholds == null) {
            return;
        }

        double value = data.getValue();
        AlertLevel level = evaluateLevel(value, thresholds);
        if (level != null) {
            String detail = String.format("%s 当前值 %.2f%s 超出正常范围",
                    data.getSensorType().getDescription(), value, data.getUnit());
            alertHandlerChain.handle(data.getZoneId(), level,
                    data.getSensorType().getDescription() + "异常", detail);
        }
    }

    private AlertLevel evaluateLevel(double value, double[] t) {
        if (value < t[0] || value > t[3]) return AlertLevel.CRITICAL;
        if (value < t[1] || value > t[2]) return AlertLevel.WARNING;
        return null;
    }

    @Override
    public String getObserverName() {
        return "AlertDataObserver";
    }
}

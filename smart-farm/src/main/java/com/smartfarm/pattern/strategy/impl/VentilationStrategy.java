package com.smartfarm.pattern.strategy.impl;

import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.strategy.ControlStrategy;
import com.smartfarm.pattern.singleton.LoggerManager;
import com.smartfarm.pattern.singleton.TaskQueue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class VentilationStrategy implements ControlStrategy {

    private static final double TEMP_HIGH = 32.0;
    private static final double HUMIDITY_HIGH = 80.0;

    @Override
    public void evaluate(SensorData data) {
        boolean needVentilation = false;
        String reason = "";

        if (data.getSensorType() == SensorType.TEMPERATURE && data.getValue() > TEMP_HIGH) {
            needVentilation = true;
            reason = "温度过高 " + data.getValue() + "°C";
        } else if (data.getSensorType() == SensorType.HUMIDITY && data.getValue() > HUMIDITY_HIGH) {
            needVentilation = true;
            reason = "湿度过高 " + data.getValue() + "%";
        }

        if (needVentilation) {
            log.info("[通风策略] {}, 启动通风", reason);
            LoggerManager.getInstance().info("通风策略触发: " + reason);
            TaskQueue.getInstance().submit("启动通风-区域" + data.getZoneId(),
                    DeviceType.VENTILATION_FAN, data.getZoneId());
        }
    }

    @Override
    public String getStrategyName() {
        return "通风策略";
    }
}

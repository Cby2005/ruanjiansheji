package com.smartfarm.pattern.strategy.impl;

import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.pattern.strategy.ControlStrategy;
import com.smartfarm.pattern.singleton.LoggerManager;
import com.smartfarm.pattern.singleton.TaskQueue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LightCompensationStrategy implements ControlStrategy {

    private static final double LOW_LIGHT_THRESHOLD = 1000.0;
    private static final double HIGH_LIGHT_THRESHOLD = 5000.0;

    @Override
    public void evaluate(SensorData data) {
        double lightLevel = data.getValue();
        if (lightLevel < LOW_LIGHT_THRESHOLD) {
            log.info("[补光策略] 光照 {}lux 低于阈值, 启动补光灯", lightLevel);
            LoggerManager.getInstance().info("补光策略触发: 光照不足 " + lightLevel + "lux");
            TaskQueue.getInstance().submit("启动补光灯-区域" + data.getZoneId(),
                    DeviceType.GROW_LIGHT, data.getZoneId());
        } else if (lightLevel > HIGH_LIGHT_THRESHOLD) {
            log.info("[补光策略] 光照 {}lux 高于阈值, 关闭补光灯", lightLevel);
            TaskQueue.getInstance().submit("关闭补光灯-区域" + data.getZoneId(),
                    DeviceType.GROW_LIGHT, data.getZoneId());
        }
    }

    @Override
    public String getStrategyName() {
        return "补光策略";
    }
}

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
public class IrrigationStrategy implements ControlStrategy {

    private static final double LOW_THRESHOLD = 30.0;
    private static final double HIGH_THRESHOLD = 70.0;

    @Override
    public void evaluate(SensorData data) {
        double moisture = data.getValue();
        if (moisture < LOW_THRESHOLD) {
            log.info("[灌溉策略] 土壤湿度 {}% 低于阈值 {}%, 启动灌溉", moisture, LOW_THRESHOLD);
            LoggerManager.getInstance().info("灌溉策略触发: 湿度过低 " + moisture + "%");
            TaskQueue.getInstance().submit("启动灌溉泵-区域" + data.getZoneId(),
                    DeviceType.IRRIGATION_PUMP, data.getZoneId());
        } else if (moisture > HIGH_THRESHOLD) {
            log.info("[灌溉策略] 土壤湿度 {}% 高于阈值 {}%, 停止灌溉", moisture, HIGH_THRESHOLD);
            TaskQueue.getInstance().submit("停止灌溉泵-区域" + data.getZoneId(),
                    DeviceType.IRRIGATION_PUMP, data.getZoneId());
        }
    }

    @Override
    public String getStrategyName() {
        return "灌溉策略";
    }
}

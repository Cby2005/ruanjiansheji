package com.cby.smartfarm.design.factory.sensor;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.common.ResultCode;
import lombok.extern.slf4j.Slf4j;

/**
 * 传感器工厂 - 工厂方法模式的具体工厂
 * 根据类型字符串创建对应的传感器实例
 */
@Slf4j
public class SensorFactory {

    public static Sensor createSensor(String type) {
        if (type == null) {
            throw new BusinessException(ResultCode.SENSOR_TYPE_ERROR);
        }
        return switch (type.toLowerCase()) {
            case "soil" -> new SoilSensor();
            case "light" -> new LightSensor();
            case "weather" -> new WeatherStationSensor();
            case "pest" -> new PestSensor();
            default -> {
                log.warn("未知的传感器类型: {}", type);
                throw new BusinessException(ResultCode.SENSOR_TYPE_ERROR);
            }
        };
    }
}

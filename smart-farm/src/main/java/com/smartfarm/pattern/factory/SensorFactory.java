package com.smartfarm.pattern.factory;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.impl.*;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;
import java.util.function.Supplier;

@Component
public class SensorFactory {

    private static final Map<SensorType, Supplier<Sensor>> SENSOR_REGISTRY = new EnumMap<>(SensorType.class);

    static {
        SENSOR_REGISTRY.put(SensorType.TEMPERATURE, TemperatureSensor::new);
        SENSOR_REGISTRY.put(SensorType.HUMIDITY, HumiditySensor::new);
        SENSOR_REGISTRY.put(SensorType.SOIL_MOISTURE, SoilMoistureSensor::new);
        SENSOR_REGISTRY.put(SensorType.LIGHT_INTENSITY, LightIntensitySensor::new);
        SENSOR_REGISTRY.put(SensorType.CO2, Co2Sensor::new);
        SENSOR_REGISTRY.put(SensorType.WATER_LEVEL, WaterLevelSensor::new);
        SENSOR_REGISTRY.put(SensorType.PH, PhSensor::new);
        SENSOR_REGISTRY.put(SensorType.WIND_SPEED, WindSpeedSensor::new);
    }

    public Sensor createSensor(SensorType type) {
        Supplier<Sensor> supplier = SENSOR_REGISTRY.get(type);
        if (supplier == null) {
            throw new IllegalArgumentException("不支持的传感器类型: " + type);
        }
        return supplier.get();
    }
}

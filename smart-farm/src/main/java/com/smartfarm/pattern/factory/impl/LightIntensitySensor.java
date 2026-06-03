package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class LightIntensitySensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.LIGHT_INTENSITY;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(200.0, 8000.0) * 10.0) / 10.0;
    }

    @Override
    public String getUnit() {
        return "lux";
    }

    @Override
    public String getName() {
        return "光照强度传感器";
    }
}

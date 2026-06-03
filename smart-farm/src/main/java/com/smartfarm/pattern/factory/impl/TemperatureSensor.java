package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class TemperatureSensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.TEMPERATURE;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(15.0, 40.0) * 10.0) / 10.0;
    }

    @Override
    public String getUnit() {
        return "°C";
    }

    @Override
    public String getName() {
        return "温度传感器";
    }
}

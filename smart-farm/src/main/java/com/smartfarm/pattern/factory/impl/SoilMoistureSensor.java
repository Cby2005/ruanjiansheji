package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class SoilMoistureSensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.SOIL_MOISTURE;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(20.0, 80.0) * 10.0) / 10.0;
    }

    @Override
    public String getUnit() {
        return "%";
    }

    @Override
    public String getName() {
        return "土壤湿度传感器";
    }
}

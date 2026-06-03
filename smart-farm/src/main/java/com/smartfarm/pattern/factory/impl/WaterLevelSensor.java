package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class WaterLevelSensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.WATER_LEVEL;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(10.0, 100.0) * 10.0) / 10.0;
    }

    @Override
    public String getUnit() {
        return "cm";
    }

    @Override
    public String getName() {
        return "水位传感器";
    }
}

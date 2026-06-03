package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class Co2Sensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.CO2;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(300.0, 2000.0) * 10.0) / 10.0;
    }

    @Override
    public String getUnit() {
        return "ppm";
    }

    @Override
    public String getName() {
        return "CO2浓度传感器";
    }
}

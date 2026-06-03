package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class PhSensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.PH;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(4.0, 9.0) * 100.0) / 100.0;
    }

    @Override
    public String getUnit() {
        return "";
    }

    @Override
    public String getName() {
        return "PH值传感器";
    }
}

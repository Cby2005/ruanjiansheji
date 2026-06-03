package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.factory.Sensor;

import java.util.concurrent.ThreadLocalRandom;

public class HumiditySensor implements Sensor {

    @Override
    public SensorType getType() {
        return SensorType.HUMIDITY;
    }

    @Override
    public double read() {
        return Math.round(ThreadLocalRandom.current().nextDouble(30.0, 95.0) * 10.0) / 10.0;
    }

    @Override
    public String getUnit() {
        return "%";
    }

    @Override
    public String getName() {
        return "空气湿度传感器";
    }
}

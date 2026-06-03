package com.smartfarm.pattern.factory;

import com.smartfarm.entity.enums.SensorType;

public interface Sensor {
    SensorType getType();
    double read();
    String getUnit();
    String getName();
}

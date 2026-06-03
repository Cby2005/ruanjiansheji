package com.smartfarm.pattern.strategy;

import com.smartfarm.entity.SensorData;

public interface ControlStrategy {
    void evaluate(SensorData data);
    String getStrategyName();
}

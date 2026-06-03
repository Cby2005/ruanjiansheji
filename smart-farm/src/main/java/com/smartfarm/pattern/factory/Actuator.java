package com.smartfarm.pattern.factory;

import com.smartfarm.entity.enums.DeviceType;

public interface Actuator {
    DeviceType getType();
    void activate();
    void deactivate();
    boolean isActive();
    String getName();
}

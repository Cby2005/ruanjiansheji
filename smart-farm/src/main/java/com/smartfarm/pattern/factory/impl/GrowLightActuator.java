package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.pattern.factory.Actuator;

public class GrowLightActuator implements Actuator {

    private boolean active = false;

    @Override
    public DeviceType getType() {
        return DeviceType.GROW_LIGHT;
    }

    @Override
    public void activate() {
        this.active = true;
    }

    @Override
    public void deactivate() {
        this.active = false;
    }

    @Override
    public boolean isActive() {
        return active;
    }

    @Override
    public String getName() {
        return "补光灯";
    }
}

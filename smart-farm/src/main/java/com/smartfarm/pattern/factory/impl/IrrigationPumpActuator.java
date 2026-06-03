package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.pattern.factory.Actuator;

public class IrrigationPumpActuator implements Actuator {

    private boolean active = false;

    @Override
    public DeviceType getType() {
        return DeviceType.IRRIGATION_PUMP;
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
        return "灌溉水泵";
    }
}

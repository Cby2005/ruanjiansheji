package com.smartfarm.pattern.factory.impl;

import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.pattern.factory.Actuator;

public class SprayNozzleActuator implements Actuator {

    private boolean active = false;

    @Override
    public DeviceType getType() {
        return DeviceType.SPRAY_NOZZLE;
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
        return "喷雾喷头";
    }
}

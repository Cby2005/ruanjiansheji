package com.smartfarm.pattern.state;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;

public interface DeviceState {
    void start(Device device);
    void stop(Device device);
    void pause(Device device);
    void resume(Device device);
    void handleError(Device device);
    void maintenance(Device device);
    DeviceStateType getStateType();
}

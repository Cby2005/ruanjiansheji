package com.smartfarm.pattern.state.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.DeviceState;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class MaintenanceState implements DeviceState {

    @Override
    public void start(Device device) {
        throw new IllegalStateException("维护中，无法启动");
    }

    @Override
    public void stop(Device device) {
        log.info("设备 [{}] 维护结束，切换到空闲", device.getName());
        device.setState(DeviceStateType.IDLE);
    }

    @Override
    public void pause(Device device) {
        throw new IllegalStateException("维护状态不能暂停");
    }

    @Override
    public void resume(Device device) {
        throw new IllegalStateException("维护状态不能恢复");
    }

    @Override
    public void handleError(Device device) {
        log.warn("维护中的设备 [{}] 发现新故障", device.getName());
    }

    @Override
    public void maintenance(Device device) {
        log.warn("设备 [{}] 已在维护中", device.getName());
    }

    @Override
    public DeviceStateType getStateType() {
        return DeviceStateType.MAINTENANCE;
    }
}

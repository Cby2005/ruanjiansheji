package com.smartfarm.pattern.state.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.DeviceState;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ErrorState implements DeviceState {

    @Override
    public void start(Device device) {
        throw new IllegalStateException("设备故障中，无法启动，请先维修");
    }

    @Override
    public void stop(Device device) {
        log.info("设备 [{}] 故障状态下执行停止", device.getName());
        device.setState(DeviceStateType.IDLE);
    }

    @Override
    public void pause(Device device) {
        throw new IllegalStateException("故障状态不能暂停");
    }

    @Override
    public void resume(Device device) {
        throw new IllegalStateException("故障状态不能恢复");
    }

    @Override
    public void handleError(Device device) {
        log.warn("设备 [{}] 已经在故障状态", device.getName());
    }

    @Override
    public void maintenance(Device device) {
        device.setState(DeviceStateType.MAINTENANCE);
        log.info("设备 [{}] 从故障切换到维护", device.getName());
    }

    @Override
    public DeviceStateType getStateType() {
        return DeviceStateType.ERROR;
    }
}

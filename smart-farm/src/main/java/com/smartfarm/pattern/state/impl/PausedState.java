package com.smartfarm.pattern.state.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.DeviceState;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Slf4j
public class PausedState implements DeviceState {

    @Override
    public void start(Device device) {
        device.setState(DeviceStateType.RUNNING);
        device.setLastStartedAt(LocalDateTime.now());
        log.info("设备 [{}] 从暂停切换到运行", device.getName());
    }

    @Override
    public void stop(Device device) {
        device.setState(DeviceStateType.IDLE);
        log.info("设备 [{}] 从暂停切换到空闲", device.getName());
    }

    @Override
    public void pause(Device device) {
        log.warn("设备 [{}] 已经是暂停状态", device.getName());
    }

    @Override
    public void resume(Device device) {
        device.setState(DeviceStateType.RUNNING);
        device.setLastStartedAt(LocalDateTime.now());
        log.info("设备 [{}] 从暂停恢复运行", device.getName());
    }

    @Override
    public void handleError(Device device) {
        device.setState(DeviceStateType.ERROR);
        log.error("设备 [{}] 暂停时发生故障", device.getName());
    }

    @Override
    public void maintenance(Device device) {
        device.setState(DeviceStateType.MAINTENANCE);
        log.info("设备 [{}] 从暂停切换到维护", device.getName());
    }

    @Override
    public DeviceStateType getStateType() {
        return DeviceStateType.PAUSED;
    }
}

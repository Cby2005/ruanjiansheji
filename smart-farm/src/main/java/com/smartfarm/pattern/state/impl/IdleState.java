package com.smartfarm.pattern.state.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.DeviceState;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Slf4j
public class IdleState implements DeviceState {

    @Override
    public void start(Device device) {
        device.setState(DeviceStateType.RUNNING);
        device.setLastStartedAt(LocalDateTime.now());
        log.info("设备 [{}] 从空闲切换到运行", device.getName());
    }

    @Override
    public void stop(Device device) {
        log.warn("设备 [{}] 已经是空闲状态", device.getName());
    }

    @Override
    public void pause(Device device) {
        throw new IllegalStateException("空闲状态不能暂停");
    }

    @Override
    public void resume(Device device) {
        log.warn("设备 [{}] 空闲状态无需恢复", device.getName());
    }

    @Override
    public void handleError(Device device) {
        device.setState(DeviceStateType.ERROR);
        log.error("设备 [{}] 从空闲切换到故障", device.getName());
    }

    @Override
    public void maintenance(Device device) {
        device.setState(DeviceStateType.MAINTENANCE);
        log.info("设备 [{}] 从空闲切换到维护", device.getName());
    }

    @Override
    public DeviceStateType getStateType() {
        return DeviceStateType.IDLE;
    }
}

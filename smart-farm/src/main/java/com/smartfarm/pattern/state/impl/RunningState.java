package com.smartfarm.pattern.state.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.DeviceState;
import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
public class RunningState implements DeviceState {

    @Override
    public void start(Device device) {
        log.warn("设备 [{}] 已经在运行中", device.getName());
    }

    @Override
    public void stop(Device device) {
        if (device.getLastStartedAt() != null) {
            long minutes = Duration.between(device.getLastStartedAt(), LocalDateTime.now()).toMinutes();
            device.setTotalRunningMinutes(device.getTotalRunningMinutes() + minutes);
        }
        device.setState(DeviceStateType.IDLE);
        log.info("设备 [{}] 从运行切换到空闲", device.getName());
    }

    @Override
    public void pause(Device device) {
        if (device.getLastStartedAt() != null) {
            long minutes = Duration.between(device.getLastStartedAt(), LocalDateTime.now()).toMinutes();
            device.setTotalRunningMinutes(device.getTotalRunningMinutes() + minutes);
        }
        device.setState(DeviceStateType.PAUSED);
        log.info("设备 [{}] 从运行切换到暂停", device.getName());
    }

    @Override
    public void resume(Device device) {
        log.warn("设备 [{}] 已在运行中", device.getName());
    }

    @Override
    public void handleError(Device device) {
        device.setState(DeviceStateType.ERROR);
        log.error("设备 [{}] 运行时发生故障", device.getName());
    }

    @Override
    public void maintenance(Device device) {
        throw new IllegalStateException("运行中的设备不能直接进入维护");
    }

    @Override
    public DeviceStateType getStateType() {
        return DeviceStateType.RUNNING;
    }
}

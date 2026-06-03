package com.smartfarm.pattern.state.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.DeviceState;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class OfflineState implements DeviceState {

    @Override
    public void start(Device device) {
        throw new IllegalStateException("设备离线，无法启动");
    }

    @Override
    public void stop(Device device) {
        log.warn("设备 [{}] 已经离线", device.getName());
    }

    @Override
    public void pause(Device device) {
        throw new IllegalStateException("设备离线，无法暂停");
    }

    @Override
    public void resume(Device device) {
        throw new IllegalStateException("设备离线，无法恢复");
    }

    @Override
    public void handleError(Device device) {
        log.warn("离线设备 [{}] 不处理故障", device.getName());
    }

    @Override
    public void maintenance(Device device) {
        device.setState(DeviceStateType.MAINTENANCE);
        log.info("离线设备 [{}] 进入维护", device.getName());
    }

    @Override
    public DeviceStateType getStateType() {
        return DeviceStateType.OFFLINE;
    }
}

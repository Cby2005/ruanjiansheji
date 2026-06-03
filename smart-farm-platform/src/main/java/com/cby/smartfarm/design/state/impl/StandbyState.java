package com.cby.smartfarm.design.state.impl;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.design.state.DeviceState;
import com.cby.smartfarm.entity.Device;
import lombok.extern.slf4j.Slf4j;

/**
 * 待机状态 - 状态模式的具体状态
 *
 * 状态模式用于管理设备生命周期，避免大量条件判断分散在业务代码中。
 * STANDBY 可以 start、maintain、calibrate，不能 stop 或 fault。
 */
@Slf4j
public class StandbyState implements DeviceState {

    @Override
    public void start(Device device) {
        device.setState("RUNNING");
        log.info("设备 {} 从待机启动为运行", device.getDeviceCode());
    }

    @Override
    public void stop(Device device) {
        throw new BusinessException("设备已处于待机状态，无需停止");
    }

    @Override
    public void fault(Device device) {
        throw new BusinessException("待机状态不能直接转为故障，请先启动");
    }

    @Override
    public void maintain(Device device) {
        device.setState("MAINTENANCE");
        log.info("设备 {} 从待机进入维护", device.getDeviceCode());
    }

    @Override
    public void calibrate(Device device) {
        device.setState("CALIBRATION");
        log.info("设备 {} 从待机进入校准", device.getDeviceCode());
    }

    @Override
    public String getStateName() {
        return "STANDBY";
    }
}

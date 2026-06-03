package com.cby.smartfarm.design.state.impl;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.design.state.DeviceState;
import com.cby.smartfarm.entity.Device;
import lombok.extern.slf4j.Slf4j;

/**
 * 运行状态 - 状态模式的具体状态
 *
 * 状态模式用于管理设备生命周期，避免大量条件判断分散在业务代码中。
 * RUNNING 可以 stop、fault，不能直接 maintain。
 */
@Slf4j
public class RunningState implements DeviceState {

    @Override
    public void start(Device device) {
        throw new BusinessException("设备已在运行中，无需重复启动");
    }

    @Override
    public void stop(Device device) {
        device.setState("STANDBY");
        log.info("设备 {} 从运行停止为待机", device.getDeviceCode());
    }

    @Override
    public void fault(Device device) {
        device.setState("FAULT");
        log.info("设备 {} 从运行转为故障", device.getDeviceCode());
    }

    @Override
    public void maintain(Device device) {
        throw new BusinessException("运行中的设备不能直接进入维护，请先停止设备");
    }

    @Override
    public void calibrate(Device device) {
        throw new BusinessException("运行中的设备不能进行校准，请先停止设备");
    }

    @Override
    public String getStateName() {
        return "RUNNING";
    }
}

package com.cby.smartfarm.design.state.impl;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.design.state.DeviceState;
import com.cby.smartfarm.entity.Device;
import lombok.extern.slf4j.Slf4j;

/**
 * 故障状态 - 状态模式的具体状态
 *
 * 状态模式用于管理设备生命周期，避免大量条件判断分散在业务代码中。
 * FAULT 只能 maintain，不能 start、stop、calibrate。
 */
@Slf4j
public class FaultState implements DeviceState {

    @Override
    public void start(Device device) {
        throw new BusinessException("设备故障中，无法启动，请先维护");
    }

    @Override
    public void stop(Device device) {
        throw new BusinessException("设备故障中，无法停止，请先维护");
    }

    @Override
    public void fault(Device device) {
        throw new BusinessException("设备已处于故障状态");
    }

    @Override
    public void maintain(Device device) {
        device.setState("MAINTENANCE");
        log.info("设备 {} 从故障进入维护", device.getDeviceCode());
    }

    @Override
    public void calibrate(Device device) {
        throw new BusinessException("故障设备不能直接校准，请先维护");
    }

    @Override
    public String getStateName() {
        return "FAULT";
    }
}

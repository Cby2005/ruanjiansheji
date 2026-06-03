package com.cby.smartfarm.design.state.impl;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.design.state.DeviceState;
import com.cby.smartfarm.entity.Device;
import lombok.extern.slf4j.Slf4j;

/**
 * 维护状态 - 状态模式的具体状态
 *
 * 状态模式用于管理设备生命周期，避免大量条件判断分散在业务代码中。
 * MAINTENANCE 可以回到 STANDBY（通过 start），不能 stop、fault、calibrate。
 */
@Slf4j
public class MaintenanceState implements DeviceState {

    @Override
    public void start(Device device) {
        device.setState("STANDBY");
        log.info("设备 {} 维护完成，回到待机", device.getDeviceCode());
    }

    @Override
    public void stop(Device device) {
        throw new BusinessException("设备正在维护中，无法停止");
    }

    @Override
    public void fault(Device device) {
        throw new BusinessException("维护中的设备不能转为故障");
    }

    @Override
    public void maintain(Device device) {
        throw new BusinessException("设备已在维护中");
    }

    @Override
    public void calibrate(Device device) {
        throw new BusinessException("维护中的设备不能直接校准，请先完成维护");
    }

    @Override
    public String getStateName() {
        return "MAINTENANCE";
    }
}

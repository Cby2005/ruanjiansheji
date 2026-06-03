package com.cby.smartfarm.design.state;

import com.cby.smartfarm.entity.Device;

/**
 * 设备状态接口 - 状态模式
 *
 * 状态模式用于管理设备生命周期，避免大量条件判断分散在业务代码中。
 * 每个状态实现类定义了该状态下允许的操作，
 * 非法转换由状态类自身拒绝，而非在 Service 中写 if-else。
 */
public interface DeviceState {

    void start(Device device);

    void stop(Device device);

    void fault(Device device);

    void maintain(Device device);

    void calibrate(Device device);

    String getStateName();
}

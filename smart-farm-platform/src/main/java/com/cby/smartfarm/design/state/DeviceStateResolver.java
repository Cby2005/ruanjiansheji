package com.cby.smartfarm.design.state;

import com.cby.smartfarm.design.state.impl.*;

/**
 * 设备状态解析器 - 状态模式辅助类
 * 根据设备当前状态字符串返回对应的状态对象
 */
public class DeviceStateResolver {

    public static DeviceState resolve(String state) {
        if (state == null) {
            return new StandbyState();
        }
        return switch (state) {
            case "STANDBY" -> new StandbyState();
            case "RUNNING" -> new RunningState();
            case "FAULT" -> new FaultState();
            case "MAINTENANCE" -> new MaintenanceState();
            case "CALIBRATION" -> new CalibrationState();
            default -> new StandbyState();
        };
    }
}

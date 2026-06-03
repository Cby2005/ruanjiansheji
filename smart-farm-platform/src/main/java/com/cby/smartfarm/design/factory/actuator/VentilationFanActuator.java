package com.cby.smartfarm.design.factory.actuator;

import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.Getter;

/**
 * 通风风机执行器 - 工厂方法模式的具体产品
 */
@Getter
public class VentilationFanActuator implements Actuator {

    private final String deviceCode;
    private final String deviceName;

    public VentilationFanActuator(String deviceCode, String deviceName) {
        this.deviceCode = deviceCode;
        this.deviceName = deviceName;
    }

    @Override
    public void start() {
        LogRecorder.getInstance().info("通风风机 " + deviceCode + " 已启动");
    }

    @Override
    public void stop() {
        LogRecorder.getInstance().info("通风风机 " + deviceCode + " 已停止");
    }

    @Override
    public void execute(String action) {
        LogRecorder.getInstance().info("通风风机 " + deviceCode + " 执行: " + action);
    }
}

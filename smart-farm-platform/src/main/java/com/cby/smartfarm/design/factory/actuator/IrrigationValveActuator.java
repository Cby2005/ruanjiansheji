package com.cby.smartfarm.design.factory.actuator;

import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.Getter;

/**
 * 灌溉阀执行器 - 工厂方法模式的具体产品
 */
@Getter
public class IrrigationValveActuator implements Actuator {

    private final String deviceCode;
    private final String deviceName;

    public IrrigationValveActuator(String deviceCode, String deviceName) {
        this.deviceCode = deviceCode;
        this.deviceName = deviceName;
    }

    @Override
    public void start() {
        LogRecorder.getInstance().info("灌溉阀 " + deviceCode + " 已启动");
    }

    @Override
    public void stop() {
        LogRecorder.getInstance().info("灌溉阀 " + deviceCode + " 已停止");
    }

    @Override
    public void execute(String action) {
        LogRecorder.getInstance().info("灌溉阀 " + deviceCode + " 执行: " + action);
    }
}

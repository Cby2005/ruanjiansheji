package com.cby.smartfarm.design.factory.actuator;

import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.Getter;

/**
 * 卷帘机执行器 - 工厂方法模式的具体产品
 */
@Getter
public class RollerShutterActuator implements Actuator {

    private final String deviceCode;
    private final String deviceName;

    public RollerShutterActuator(String deviceCode, String deviceName) {
        this.deviceCode = deviceCode;
        this.deviceName = deviceName;
    }

    @Override
    public void start() {
        LogRecorder.getInstance().info("卷帘机 " + deviceCode + " 已启动");
    }

    @Override
    public void stop() {
        LogRecorder.getInstance().info("卷帘机 " + deviceCode + " 已停止");
    }

    @Override
    public void execute(String action) {
        LogRecorder.getInstance().info("卷帘机 " + deviceCode + " 执行: " + action);
    }
}

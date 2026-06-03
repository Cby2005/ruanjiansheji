package com.cby.smartfarm.design.factory.actuator;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.common.ResultCode;
import lombok.extern.slf4j.Slf4j;

/**
 * 执行器工厂 - 工厂方法模式的具体工厂
 * 根据类型创建对应的执行器实例
 */
@Slf4j
public class ActuatorFactory {

    public static Actuator createActuator(String type, String deviceCode, String deviceName) {
        if (type == null) {
            throw new BusinessException(ResultCode.DEVICE_STATE_ERROR);
        }
        return switch (type.toLowerCase()) {
            case "irrigation" -> new IrrigationValveActuator(deviceCode, deviceName);
            case "light" -> new FillLightActuator(deviceCode, deviceName);
            case "fan" -> new VentilationFanActuator(deviceCode, deviceName);
            case "roller" -> new RollerShutterActuator(deviceCode, deviceName);
            case "heater" -> new HeaterActuator(deviceCode, deviceName);
            default -> {
                log.warn("未知的执行器类型: {}", type);
                throw new BusinessException(ResultCode.DEVICE_STATE_ERROR);
            }
        };
    }
}

package com.cby.smartfarm.design.proxy;

import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.entity.DeviceOperationLog;
import com.cby.smartfarm.repository.DeviceOperationLogRepository;
import com.cby.smartfarm.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 真实远程设备服务 - 代理模式的真实对象
 *
 * 代理模式用于在真实设备访问之前增加权限校验和操作审计。
 * 本类负责真正的设备控制逻辑，但不会被外部直接调用，
 * 所有请求必须经过 RemoteDeviceServiceProxy 代理。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RealRemoteDeviceService implements RemoteDeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceOperationLogRepository operationLogRepository;

    @Override
    public String controlDevice(String username, String deviceCode, String action) {
        Device device = deviceRepository.findByDeviceCode(deviceCode)
                .orElseThrow(() -> new IllegalArgumentException("设备不存在: " + deviceCode));

        String result = executeAction(device, action);

        deviceRepository.save(device);
        logOperation(device, action, username, result);
        LogRecorder.getInstance().info("真实设备控制: " + username + " 对 " + deviceCode + " 执行 " + action);
        return result;
    }

    private String executeAction(Device device, String action) {
        return switch (action.toUpperCase()) {
            case "START" -> {
                device.setState("RUNNING");
                yield "设备 " + device.getDeviceCode() + " 已启动";
            }
            case "STOP" -> {
                device.setState("STANDBY");
                yield "设备 " + device.getDeviceCode() + " 已停止";
            }
            case "FAULT" -> {
                device.setState("FAULT");
                yield "设备 " + device.getDeviceCode() + " 已标记故障";
            }
            case "MAINTAIN" -> {
                device.setState("MAINTENANCE");
                yield "设备 " + device.getDeviceCode() + " 已进入维护";
            }
            case "CALIBRATE" -> {
                device.setState("CALIBRATION");
                yield "设备 " + device.getDeviceCode() + " 已进入校准";
            }
            default -> throw new IllegalArgumentException("不支持的操作: " + action);
        };
    }

    private void logOperation(Device device, String action, String operator, String result) {
        DeviceOperationLog opLog = new DeviceOperationLog();
        opLog.setDeviceCode(device.getDeviceCode());
        opLog.setDeviceName(device.getDeviceName());
        opLog.setAction(action);
        opLog.setOperator(operator);
        opLog.setResult(result);
        operationLogRepository.save(opLog);
    }
}

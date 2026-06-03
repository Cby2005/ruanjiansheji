package com.cby.smartfarm.design.command;

import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.entity.DeviceOperationLog;
import com.cby.smartfarm.repository.DeviceOperationLogRepository;
import com.cby.smartfarm.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 命令接收者 - 命令模式
 * 真正执行设备状态修改和操作日志记录的组件。
 * 所有命令对象通过调用本类的方法来完成实际操作，
 * 实现了命令与执行逻辑的解耦。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceCommandReceiver {

    private final DeviceRepository deviceRepository;
    private final DeviceOperationLogRepository operationLogRepository;

    public Device findDevice(String deviceCode) {
        return deviceRepository.findByDeviceCode(deviceCode)
                .orElseThrow(() -> new IllegalArgumentException("设备不存在: " + deviceCode));
    }

    public void startDevice(String deviceCode, String operator, String action) {
        Device device = findDevice(deviceCode);
        device.setState("RUNNING");
        deviceRepository.save(device);
        logOperation(device, action, operator, "SUCCESS");
        LogRecorder.getInstance().info("命令执行: " + action + " 设备 " + deviceCode);
    }

    public void stopDevice(String deviceCode, String operator, String action) {
        Device device = findDevice(deviceCode);
        device.setState("STANDBY");
        deviceRepository.save(device);
        logOperation(device, action, operator, "SUCCESS");
        LogRecorder.getInstance().info("命令执行: " + action + " 设备 " + deviceCode);
    }

    public void adjustDevice(String deviceCode, String operator, String action, String value) {
        Device device = findDevice(deviceCode);
        device.setState("RUNNING");
        deviceRepository.save(device);
        logOperation(device, action + "(" + value + ")", operator, "SUCCESS");
        LogRecorder.getInstance().info("命令执行: " + action + " 设备 " + deviceCode + " 参数 " + value);
    }

    public void undoAction(String deviceCode, String operator, String action) {
        Device device = findDevice(deviceCode);
        device.setState("STANDBY");
        deviceRepository.save(device);
        logOperation(device, "UNDO:" + action, operator, "SUCCESS");
        LogRecorder.getInstance().info("命令撤销: " + action + " 设备 " + deviceCode);
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

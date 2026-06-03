package com.cby.smartfarm.service;

import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.design.state.DeviceState;
import com.cby.smartfarm.design.state.DeviceStateResolver;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.entity.DeviceOperationLog;
import com.cby.smartfarm.repository.DeviceOperationLogRepository;
import com.cby.smartfarm.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final DeviceOperationLogRepository operationLogRepository;

    public List<Device> findAll() {
        return deviceRepository.findAll();
    }

    public Device findByCode(String deviceCode) {
        return deviceRepository.findByDeviceCode(deviceCode)
                .orElseThrow(() -> new IllegalArgumentException("设备不存在: " + deviceCode));
    }

    /**
     * 【状态模式】启动设备
     * 通过 DeviceStateResolver 解析当前状态对象，调用状态对象的 start() 方法
     * 状态转换合法性由状态类自身判断，Service 无需写 if-else
     */
    @Transactional
    public Device startDevice(String deviceCode) {
        return changeState(deviceCode, "START", DeviceState::start);
    }

    /**
     * 【状态模式】停止设备
     */
    @Transactional
    public Device stopDevice(String deviceCode) {
        return changeState(deviceCode, "STOP", DeviceState::stop);
    }

    /**
     * 【状态模式】标记故障
     */
    @Transactional
    public Device markFault(String deviceCode) {
        return changeState(deviceCode, "FAULT", DeviceState::fault);
    }

    /**
     * 【状态模式】进入维护
     */
    @Transactional
    public Device maintainDevice(String deviceCode) {
        return changeState(deviceCode, "MAINTAIN", DeviceState::maintain);
    }

    /**
     * 【状态模式】进入校准
     */
    @Transactional
    public Device calibrateDevice(String deviceCode) {
        return changeState(deviceCode, "CALIBRATE", DeviceState::calibrate);
    }

    /**
     * 状态模式核心方法：
     * 1. 查找设备
     * 2. 通过 DeviceStateResolver 获取当前状态对象
     * 3. 调用状态对象的方法（内部判断是否允许转换）
     * 4. 保存设备状态变更
     * 5. 写入操作日志
     */
    private Device changeState(String deviceCode, String action, StateAction stateAction) {
        Device device = findByCode(deviceCode);
        String oldState = device.getState();

        // 状态模式：根据当前状态字符串获取对应的状态对象
        DeviceState currentState = DeviceStateResolver.resolve(oldState);
        // 状态模式：调用状态对象的方法，非法转换会在状态类内部抛出 BusinessException
        stateAction.apply(currentState, device);

        deviceRepository.save(device);
        logOperation(device, action, oldState);
        LogRecorder.getInstance().info("设备 " + deviceCode + " 状态变更: " + oldState + " → " + device.getState());
        return device;
    }

    private void logOperation(Device device, String action, String oldState) {
        DeviceOperationLog opLog = new DeviceOperationLog();
        opLog.setDeviceCode(device.getDeviceCode());
        opLog.setDeviceName(device.getDeviceName());
        opLog.setAction(action);
        opLog.setOperator("system");
        opLog.setResult(oldState + " → " + device.getState());
        operationLogRepository.save(opLog);
    }

    /**
     * 初始化5个默认设备到数据库
     */
    @Transactional
    public List<Device> initDefaultDevices() {
        String[][] defaults = {
                {"IRR-001", "A区滴灌阀", "IRRIGATION", "A区"},
                {"LIGHT-001", "A区补光灯", "LIGHT", "A区"},
                {"FAN-001", "A区通风风机", "FAN", "A区"},
                {"ROLLER-001", "A区卷帘机", "ROLLER", "A区"},
                {"HEATER-001", "A区加热器", "HEATER", "A区"}
        };

        for (String[] d : defaults) {
            if (deviceRepository.findByDeviceCode(d[0]).isPresent()) {
                continue;
            }
            Device device = new Device();
            device.setDeviceCode(d[0]);
            device.setDeviceName(d[1]);
            device.setDeviceType(d[2]);
            device.setArea(d[3]);
            device.setState("STANDBY");
            device.setOnline(true);
            deviceRepository.save(device);
            log.info("设备初始化: {} - {}", d[0], d[1]);
        }
        return deviceRepository.findAll();
    }

    @FunctionalInterface
    private interface StateAction {
        void apply(DeviceState state, Device device);
    }
}

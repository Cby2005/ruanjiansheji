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

    @Transactional
    public Device startDevice(String deviceCode) {
        return changeState(deviceCode, "START", DeviceState::start);
    }

    @Transactional
    public Device stopDevice(String deviceCode) {
        return changeState(deviceCode, "STOP", DeviceState::stop);
    }

    @Transactional
    public Device markFault(String deviceCode) {
        return changeState(deviceCode, "FAULT", DeviceState::fault);
    }

    @Transactional
    public Device maintainDevice(String deviceCode) {
        return changeState(deviceCode, "MAINTAIN", DeviceState::maintain);
    }

    @Transactional
    public Device calibrateDevice(String deviceCode) {
        return changeState(deviceCode, "CALIBRATE", DeviceState::calibrate);
    }

    @Transactional
    public List<Device> initDefaultDevices() {
        String[][] defaults = {
                {"IRR-001", "A区滴灌阀", "IRRIGATION", "A区"},
                {"LIGHT-001", "A区补光灯", "LIGHT", "A区"},
                {"FAN-001", "A区通风风机", "FAN", "A区"},
                {"ROLLER-001", "A区卷帘机", "ROLLER", "A区"},
                {"HEATER-001", "A区加热器", "HEATER", "A区"},
                {"FERT-001", "A区变量施肥机", "FERTILIZER", "A区"}
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
            log.info("Default device initialized: {} - {}", d[0], d[1]);
        }
        return deviceRepository.findAll();
    }

    @Transactional
    public void logOperation(String deviceCode, String action, String operator, String result) {
        Device device = findByCode(deviceCode);
        DeviceOperationLog opLog = new DeviceOperationLog();
        opLog.setDeviceCode(device.getDeviceCode());
        opLog.setDeviceName(device.getDeviceName());
        opLog.setAction(action);
        opLog.setOperator(operator);
        opLog.setResult(result);
        operationLogRepository.save(opLog);
    }

    private Device changeState(String deviceCode, String action, StateAction stateAction) {
        Device device = findByCode(deviceCode);
        String oldState = device.getState();
        DeviceState currentState = DeviceStateResolver.resolve(oldState);
        stateAction.apply(currentState, device);

        Device saved = deviceRepository.save(device);
        logOperation(saved, action, "system", oldState + " -> " + saved.getState());
        LogRecorder.getInstance().info("设备 " + deviceCode + " 状态变更: " + oldState + " -> " + saved.getState());
        return saved;
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

    @FunctionalInterface
    private interface StateAction {
        void apply(DeviceState state, Device device);
    }
}

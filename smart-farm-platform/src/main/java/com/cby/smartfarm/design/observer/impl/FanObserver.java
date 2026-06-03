package com.cby.smartfarm.design.observer.impl;

import com.cby.smartfarm.config.FarmConfigCenter;
import com.cby.smartfarm.design.observer.EnvironmentObserver;
import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.design.strategy.VentilationStrategy;
import com.cby.smartfarm.design.strategy.impl.ForcedVentilationStrategy;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.entity.DeviceOperationLog;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.DeviceOperationLogRepository;
import com.cby.smartfarm.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 通风观察者 - 观察者模式的具体观察者
 *
 * 【观察者模式】当 CO₂ 浓度或空气温度超过阈值时，自动触发通风策略，
 * 启动风机并将操作写入设备日志。
 * Controller 不直接判断阈值，判断逻辑完全在此观察者内部。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class FanObserver implements EnvironmentObserver {

    private final FarmConfigCenter configCenter;
    private final DeviceRepository deviceRepository;
    private final DeviceOperationLogRepository operationLogRepository;

    private final List<String> actions = new ArrayList<>();

    @Override
    public void update(EnvironmentRecord record) {
        actions.clear();
        boolean triggered = false;
        String reason = "";

        if (record.getCo2() != null && record.getCo2() > configCenter.getCo2Max()) {
            triggered = true;
            reason = "CO₂浓度 " + record.getCo2() + "ppm 超过阈值 " + configCenter.getCo2Max() + "ppm";
        }
        if (record.getAirTemperature() != null &&
                record.getAirTemperature() > configCenter.getAirTemperatureMax()) {
            triggered = true;
            reason = "空气温度 " + record.getAirTemperature() + "°C 超过阈值 "
                    + configCenter.getAirTemperatureMax() + "°C";
        }

        if (triggered) {
            final String finalReason = reason;
            String msg = reason + "，自动启动通风风机";
            log.info("【观察者模式-FanObserver】{}", msg);
            LogRecorder.getInstance().info("通风观察者: " + msg);

            VentilationStrategy strategy = new ForcedVentilationStrategy();
            strategy.ventilate(finalReason);

            deviceRepository.findByDeviceCode("FAN-001").ifPresent(device -> {
                device.setState("RUNNING");
                deviceRepository.save(device);
                logOperation(device, "AUTO_START", "FanObserver",
                        "环境异常自动启动风机，" + finalReason);
            });

            actions.add("通风观察者: " + msg);
        }
    }

    @Override
    public String getObserverName() {
        return "通风观察者(FanObserver)";
    }

    @Override
    public List<String> getTriggeredActions() {
        return new ArrayList<>(actions);
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

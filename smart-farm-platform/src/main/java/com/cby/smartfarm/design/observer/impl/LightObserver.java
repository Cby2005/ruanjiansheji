package com.cby.smartfarm.design.observer.impl;

import com.cby.smartfarm.config.FarmConfigCenter;
import com.cby.smartfarm.design.observer.EnvironmentObserver;
import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.design.strategy.LightingStrategy;
import com.cby.smartfarm.design.strategy.impl.SeedlingLightingStrategy;
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
 * 补光观察者 - 观察者模式的具体观察者
 *
 * 【观察者模式】当光照强度低于阈值时，自动触发补光策略，
 * 启动补光灯并将操作写入设备日志。
 * Controller 不直接判断阈值，判断逻辑完全在此观察者内部。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LightObserver implements EnvironmentObserver {

    private final FarmConfigCenter configCenter;
    private final DeviceRepository deviceRepository;
    private final DeviceOperationLogRepository operationLogRepository;

    private final List<String> actions = new ArrayList<>();

    @Override
    public void update(EnvironmentRecord record) {
        actions.clear();
        if (record.getLightIntensity() != null &&
                record.getLightIntensity() < configCenter.getLightIntensityMin()) {

            String msg = "光照强度 " + record.getLightIntensity() + "lux 低于阈值 "
                    + configCenter.getLightIntensityMin() + "lux，自动开启补光灯";
            log.info("【观察者模式-LightObserver】{}", msg);
            LogRecorder.getInstance().info("补光观察者: " + msg);

            // 调用策略模式执行补光
            LightingStrategy strategy = new SeedlingLightingStrategy();
            strategy.supplementLight("当前阶段");

            // 更新设备状态并记录操作日志
            deviceRepository.findByDeviceCode("LIGHT-001").ifPresent(device -> {
                device.setState("RUNNING");
                deviceRepository.save(device);
                logOperation(device, "AUTO_START", "LightObserver",
                        "光照不足自动开启补光灯，光照: " + record.getLightIntensity() + "lux");
            });

            actions.add("补光观察者: " + msg);
        }
    }

    @Override
    public String getObserverName() {
        return "补光观察者(LightObserver)";
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

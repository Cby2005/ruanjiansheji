package com.cby.smartfarm.design.observer.impl;

import com.cby.smartfarm.config.FarmConfigCenter;
import com.cby.smartfarm.design.observer.EnvironmentObserver;
import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.design.strategy.IrrigationStrategy;
import com.cby.smartfarm.design.strategy.impl.DripIrrigationStrategy;
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
 * 灌溉观察者 - 观察者模式的具体观察者
 *
 * 【观察者模式】当土壤湿度低于阈值时，自动触发灌溉策略，
 * 启动灌溉阀并将操作写入设备日志。
 * Controller 不直接判断阈值，判断逻辑完全在此观察者内部。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IrrigationObserver implements EnvironmentObserver {

    private final FarmConfigCenter configCenter;
    private final DeviceRepository deviceRepository;
    private final DeviceOperationLogRepository operationLogRepository;

    private final List<String> actions = new ArrayList<>();

    @Override
    public void update(EnvironmentRecord record) {
        actions.clear();
        if (record.getSoilHumidity() != null &&
                record.getSoilHumidity() < configCenter.getSoilHumidityMin()) {

            String msg = "土壤湿度 " + record.getSoilHumidity() + "% 低于阈值 "
                    + configCenter.getSoilHumidityMin() + "%，自动启动灌溉";
            log.info("【观察者模式-IrrigationObserver】{}", msg);
            LogRecorder.getInstance().info("灌溉观察者: " + msg);

            // 调用策略模式执行灌溉
            IrrigationStrategy strategy = new DripIrrigationStrategy();
            strategy.irrigate("A区");

            // 更新设备状态并记录操作日志
            deviceRepository.findByDeviceCode("IRR-001").ifPresent(device -> {
                device.setState("RUNNING");
                deviceRepository.save(device);
                logOperation(device, "AUTO_START", "IrrigationObserver",
                        "土壤湿度过低自动启动灌溉，湿度: " + record.getSoilHumidity() + "%");
            });

            actions.add("灌溉观察者: " + msg);
        }
    }

    @Override
    public String getObserverName() {
        return "灌溉观察者(IrrigationObserver)";
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

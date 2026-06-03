package com.smartfarm.controller;

import com.smartfarm.common.Result;
import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.decorator.BaseDeviceFunction;
import com.smartfarm.pattern.decorator.DeviceFunction;
import com.smartfarm.pattern.decorator.impl.EnergyMonitorDecorator;
import com.smartfarm.pattern.decorator.impl.RuntimeStatsDecorator;
import com.smartfarm.pattern.factory.Actuator;
import com.smartfarm.pattern.factory.ActuatorFactory;
import com.smartfarm.pattern.factory.Sensor;
import com.smartfarm.pattern.factory.SensorFactory;
import com.smartfarm.pattern.singleton.ConfigCenter;
import com.smartfarm.pattern.singleton.LoggerManager;
import com.smartfarm.pattern.singleton.TaskQueue;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/patterns")
@Tag(name = "设计模式演示", description = "展示课程设计中使用的9种设计模式")
public class DesignPatternController {

    @Autowired
    private SensorFactory sensorFactory;

    @Autowired
    private ActuatorFactory actuatorFactory;

    @GetMapping("/factory/sensor/{type}")
    @Operation(summary = "【工厂模式】创建指定类型传感器并读取模拟数据")
    public Result<Map<String, Object>> factorySensor(@PathVariable SensorType type) {
        Sensor sensor = sensorFactory.createSensor(type);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("模式", "工厂方法模式 (Factory Method)");
        result.put("传感器名称", sensor.getName());
        result.put("传感器类型", sensor.getType().name());
        result.put("模拟读数", sensor.read());
        result.put("单位", sensor.getUnit());
        return Result.success(result);
    }

    @GetMapping("/factory/actuator/{type}")
    @Operation(summary = "【工厂模式】创建指定类型执行器")
    public Result<Map<String, Object>> factoryActuator(@PathVariable DeviceType type) {
        Actuator actuator = actuatorFactory.createActuator(type);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("模式", "工厂方法模式 (Factory Method)");
        result.put("执行器名称", actuator.getName());
        result.put("执行器类型", actuator.getType().name());
        result.put("当前状态", actuator.isActive() ? "运行中" : "未启动");
        return Result.success(result);
    }

    @GetMapping("/singleton/config")
    @Operation(summary = "【单例模式】查看配置中心所有配置")
    public Result<Map<String, Object>> singletonConfig() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("模式", "单例模式 (Singleton)");
        result.put("实例", ConfigCenter.getInstance().toString());
        result.put("配置项", ConfigCenter.getInstance().getAll());
        return Result.success(result);
    }

    @PutMapping("/singleton/config")
    @Operation(summary = "【单例模式】更新配置项")
    public Result<String> updateConfig(@RequestParam String key, @RequestParam String value) {
        ConfigCenter.getInstance().set(key, value);
        return Result.success("配置已更新: " + key + " = " + value);
    }

    @GetMapping("/singleton/logger")
    @Operation(summary = "【单例模式】查看最近系统日志")
    public Result<List<LoggerManager.LogEntry>> singletonLogger(
            @RequestParam(defaultValue = "50") int count) {
        return Result.success(LoggerManager.getInstance().getRecentLogs(count));
    }

    @GetMapping("/singleton/taskqueue")
    @Operation(summary = "【单例模式】查看任务队列")
    public Result<Map<String, Object>> singletonTaskQueue() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("模式", "单例模式 (Singleton)");
        result.put("队列大小", TaskQueue.getInstance().getQueueSize());
        result.put("最近任务", TaskQueue.getInstance().getHistory(20));
        return Result.success(result);
    }

    @GetMapping("/decorator/{deviceName}")
    @Operation(summary = "【装饰器模式】动态装饰设备功能")
    public Result<Map<String, Object>> decoratorDemo(@PathVariable String deviceName) {
        DeviceFunction base = new BaseDeviceFunction(deviceName);
        EnergyMonitorDecorator withEnergy = new EnergyMonitorDecorator(base);
        RuntimeStatsDecorator fullFeature = new RuntimeStatsDecorator(withEnergy);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("模式", "装饰器模式 (Decorator)");
        result.put("基础功能", base.getDescription());
        result.put("基础费用", base.getExtraCost());
        result.put("加能耗监测", withEnergy.getDescription());
        result.put("加能耗费用", withEnergy.getExtraCost());
        result.put("完整功能", fullFeature.getDescription());
        result.put("完整费用", fullFeature.getExtraCost());
        result.put("当前功率W", withEnergy.getCurrentPowerConsumption());
        result.put("累计运行小时", fullFeature.getTotalRunningHours());
        return Result.success(result);
    }

    @GetMapping("/summary")
    @Operation(summary = "设计模式总览")
    public Result<Map<String, String>> summary() {
        Map<String, String> patterns = new LinkedHashMap<>();
        patterns.put("1.工厂方法模式", "SensorFactory/ActuatorFactory 创建传感器和执行器");
        patterns.put("2.观察者模式", "DataSubject/DataObserver 环境数据变化触发自动控制");
        patterns.put("3.策略模式", "IrrigationStrategy/LightCompensationStrategy/VentilationStrategy");
        patterns.put("4.命令模式", "DeviceCommand/CommandInvoker 设备控制指令封装与撤销");
        patterns.put("5.状态模式", "DeviceState 设备工作状态管理(空闲/运行/暂停/故障/维护/离线)");
        patterns.put("6.责任链模式", "AlertHandlerChain 异常事件分级(INFO/WARNING/ERROR/CRITICAL)处理");
        patterns.put("7.单例模式", "ConfigCenter/LoggerManager/TaskQueue 全局唯一实例");
        patterns.put("8.代理模式", "DeviceAccessProxy 远程设备访问权限控制");
        patterns.put("9.装饰器模式", "EnergyMonitorDecorator/RuntimeStatsDecorator 动态添加功能");
        return Result.success(patterns);
    }
}

package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.decorator.BasicSmartDevice;
import com.cby.smartfarm.design.decorator.SmartDevice;
import com.cby.smartfarm.design.decorator.impl.EnergyMonitorDecorator;
import com.cby.smartfarm.design.decorator.impl.FaultPredictionDecorator;
import com.cby.smartfarm.design.decorator.impl.RuntimeStatisticsDecorator;
import com.cby.smartfarm.design.proxy.RemoteDeviceServiceProxy;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 设备控制器
 * 包含状态模式、代理模式、装饰器模式的演示接口
 */
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@Tag(name = "设备管理", description = "设备查询、状态管理、远程控制、装饰器演示")
public class DeviceController {

    private final DeviceService deviceService;
    private final RemoteDeviceServiceProxy remoteDeviceServiceProxy;

    @GetMapping("/list")
    @Operation(summary = "查询所有设备")
    public Result<List<Device>> list() {
        return Result.success(deviceService.findAll());
    }

    @GetMapping("/{deviceCode}")
    @Operation(summary = "根据设备编号查询设备")
    public Result<Device> getByCode(@PathVariable String deviceCode) {
        return Result.success(deviceService.findByCode(deviceCode));
    }

    @PostMapping("/{deviceCode}/start")
    @Operation(summary = "启动设备（状态模式：STANDBY→RUNNING）")
    public Result<Device> start(@PathVariable String deviceCode) {
        return Result.success(deviceService.startDevice(deviceCode));
    }

    @PostMapping("/{deviceCode}/stop")
    @Operation(summary = "停止设备（状态模式：RUNNING→STANDBY）")
    public Result<Device> stop(@PathVariable String deviceCode) {
        return Result.success(deviceService.stopDevice(deviceCode));
    }

    @PostMapping("/{deviceCode}/fault")
    @Operation(summary = "标记故障（状态模式：RUNNING→FAULT）")
    public Result<Device> fault(@PathVariable String deviceCode) {
        return Result.success(deviceService.markFault(deviceCode));
    }

    @PostMapping("/{deviceCode}/maintain")
    @Operation(summary = "进入维护（状态模式：FAULT/STANDBY→MAINTENANCE）")
    public Result<Device> maintain(@PathVariable String deviceCode) {
        return Result.success(deviceService.maintainDevice(deviceCode));
    }

    @PostMapping("/{deviceCode}/calibrate")
    @Operation(summary = "进入校准（状态模式：STANDBY→CALIBRATION）")
    public Result<Device> calibrate(@PathVariable String deviceCode) {
        return Result.success(deviceService.calibrateDevice(deviceCode));
    }

    @PostMapping("/remote-control")
    @Operation(summary = "远程控制设备（代理模式演示）")
    public Result<Map<String, Object>> remoteControl(
            @RequestParam String username,
            @RequestParam String deviceCode,
            @RequestParam String action) {

        String result = remoteDeviceServiceProxy.controlDevice(username, deviceCode, action);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("用户名", username);
        data.put("设备编号", deviceCode);
        data.put("操作", action);
        data.put("结果", result);
        data.put("说明", "代理模式：所有远程控制请求必须经过 RemoteDeviceServiceProxy 进行权限校验");
        return Result.success(data);
    }

    /**
     * 【装饰器模式演示接口】
     * 对一个普通设备动态叠加功能：
     * 1. 基础设备 BasicSmartDevice（只有基本运行能力）
     * 2. 叠加 EnergyMonitorDecorator（能耗监测）
     * 3. 叠加 RuntimeStatisticsDecorator（运行时长统计）
     * 4. 叠加 FaultPredictionDecorator（故障预诊断）
     *
     * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
     */
    @GetMapping("/decorator-demo/{deviceCode}")
    @Operation(summary = "装饰器模式演示 - 动态叠加设备功能")
    public Result<Map<String, Object>> decoratorDemo(@PathVariable String deviceCode) {
        Device device = deviceService.findByCode(deviceCode);

        // 装饰器模式：从基础设备开始，逐层叠加装饰器
        SmartDevice smartDevice = new BasicSmartDevice(device.getDeviceCode(), device.getDeviceName());
        smartDevice = new EnergyMonitorDecorator(smartDevice);
        smartDevice = new RuntimeStatisticsDecorator(smartDevice);
        smartDevice = new FaultPredictionDecorator(smartDevice);

        // 调用 operate() 时会依次执行所有装饰器的功能
        smartDevice.operate();

        // 模拟各装饰器提供的数据
        double energy = Math.round(java.util.concurrent.ThreadLocalRandom.current().nextDouble(0.1, 1.0) * 100.0) / 100.0;
        double hours = Math.round(java.util.concurrent.ThreadLocalRandom.current().nextDouble(1.0, 100.0) * 10.0) / 10.0;
        String risk = new String[]{"低", "中", "高"}[java.util.concurrent.ThreadLocalRandom.current().nextInt(3)];

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("device", device.getDeviceName());
        result.put("description", smartDevice.getDescription());
        result.put("result", "设备已运行，本次能耗" + energy + "kWh，累计运行" + hours + "小时，故障风险" + risk);
        result.put("说明", "装饰器模式：在不修改原有设备类的前提下动态增加功能，符合开闭原则");
        return Result.success(result);
    }
}

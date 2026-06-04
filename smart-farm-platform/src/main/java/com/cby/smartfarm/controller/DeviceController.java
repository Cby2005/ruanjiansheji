package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.adapter.LegacyVariableFertilizer;
import com.cby.smartfarm.design.adapter.SmartActuatorPort;
import com.cby.smartfarm.design.adapter.VariableFertilizerAdapter;
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
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
@Tag(name = "设备管理", description = "设备查询、状态管理、远程控制、装饰器和适配器演示")
public class DeviceController {

    private final DeviceService deviceService;
    private final RemoteDeviceServiceProxy remoteDeviceServiceProxy;

    @GetMapping("/list")
    @Operation(summary = "查询全部设备")
    public Result<List<Device>> list() {
        return Result.success(deviceService.findAll());
    }

    @GetMapping("/{deviceCode}")
    @Operation(summary = "根据设备编号查询设备")
    public Result<Device> getByCode(@PathVariable String deviceCode) {
        return Result.success(deviceService.findByCode(deviceCode));
    }

    @PostMapping
    @Operation(summary = "Create device")
    public Result<Device> create(@RequestBody Device device) {
        return Result.success(deviceService.create(device));
    }

    @PutMapping("/{deviceCode}")
    @Operation(summary = "Update device")
    public Result<Device> update(@PathVariable String deviceCode, @RequestBody Device device) {
        return Result.success(deviceService.update(deviceCode, device));
    }

    @DeleteMapping("/{deviceCode}")
    @Operation(summary = "Delete device")
    public Result<String> delete(@PathVariable String deviceCode) {
        deviceService.delete(deviceCode);
        return Result.success("deleted");
    }

    @PostMapping("/{deviceCode}/start")
    @Operation(summary = "启动设备，状态模式演示")
    public Result<Device> start(@PathVariable String deviceCode) {
        return Result.success(deviceService.startDevice(deviceCode));
    }

    @PostMapping("/{deviceCode}/stop")
    @Operation(summary = "停止设备，状态模式演示")
    public Result<Device> stop(@PathVariable String deviceCode) {
        return Result.success(deviceService.stopDevice(deviceCode));
    }

    @PostMapping("/{deviceCode}/fault")
    @Operation(summary = "标记设备故障，状态模式演示")
    public Result<Device> fault(@PathVariable String deviceCode) {
        return Result.success(deviceService.markFault(deviceCode));
    }

    @PostMapping("/{deviceCode}/maintain")
    @Operation(summary = "设备进入维护状态，状态模式演示")
    public Result<Device> maintain(@PathVariable String deviceCode) {
        return Result.success(deviceService.maintainDevice(deviceCode));
    }

    @PostMapping("/{deviceCode}/calibrate")
    @Operation(summary = "设备进入校准状态，状态模式演示")
    public Result<Device> calibrate(@PathVariable String deviceCode) {
        return Result.success(deviceService.calibrateDevice(deviceCode));
    }

    @PostMapping("/remote-control")
    @Operation(summary = "远程控制设备，代理模式演示")
    public Result<Map<String, Object>> remoteControl(
            @RequestParam String username,
            @RequestParam String deviceCode,
            @RequestParam String action) {
        String controlResult = remoteDeviceServiceProxy.controlDevice(username, deviceCode, action);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("username", username);
        data.put("deviceCode", deviceCode);
        data.put("action", action);
        data.put("result", controlResult);
        data.put("description", "代理模式：所有远程控制请求先经过 RemoteDeviceServiceProxy 完成权限校验和审计");
        return Result.success(data);
    }

    @GetMapping("/decorator-demo/{deviceCode}")
    @Operation(summary = "装饰器模式演示 - 动态增强设备能力")
    public Result<Map<String, Object>> decoratorDemo(@PathVariable String deviceCode) {
        Device device = deviceService.findByCode(deviceCode);

        SmartDevice smartDevice = new BasicSmartDevice(device.getDeviceCode(), device.getDeviceName());
        smartDevice = new EnergyMonitorDecorator(smartDevice);
        smartDevice = new RuntimeStatisticsDecorator(smartDevice);
        smartDevice = new FaultPredictionDecorator(smartDevice);
        smartDevice.operate();

        double energy = Math.round(ThreadLocalRandom.current().nextDouble(0.1, 1.0) * 100.0) / 100.0;
        double hours = Math.round(ThreadLocalRandom.current().nextDouble(1.0, 100.0) * 10.0) / 10.0;
        String risk = new String[]{"低", "中", "高"}[ThreadLocalRandom.current().nextInt(3)];

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("device", device.getDeviceName());
        result.put("description", smartDevice.getDescription());
        result.put("result", "设备已运行，本次能耗 " + energy + "kWh，累计运行 " + hours + " 小时，故障风险 " + risk);
        result.put("pattern", "Decorator");
        return Result.success(result);
    }

    @PostMapping("/adapter-demo")
    @Operation(summary = "适配器模式演示 - 接入第三方变量施肥机")
    public Result<Map<String, Object>> adapterDemo(
            @RequestParam(defaultValue = "A区") String area,
            @RequestParam(defaultValue = "12.5") double kilogramPerMu) {
        SmartActuatorPort actuator = new VariableFertilizerAdapter(new LegacyVariableFertilizer());
        String executionResult = actuator.execute(area, "FERTILIZE", kilogramPerMu);
        deviceService.logOperation("FERT-001", "FERTILIZE", "adapter-demo", executionResult);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("pattern", "Adapter");
        result.put("standardInterface", "SmartActuatorPort.execute(area, action, value)");
        result.put("legacyDevice", "LegacyVariableFertilizer.applyFertilizer(plotNo, kilogramPerMu)");
        result.put("deviceType", actuator.getDeviceType());
        result.put("result", executionResult);
        result.put("description", "适配器模式把第三方变量施肥机接口转换为平台统一执行器接口");
        return Result.success(result);
    }
}

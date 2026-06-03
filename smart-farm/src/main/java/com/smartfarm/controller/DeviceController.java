package com.smartfarm.controller;

import com.smartfarm.common.Result;
import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/devices")
@Tag(name = "设备管理", description = "设备的增删改查与控制")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @GetMapping
    @Operation(summary = "获取所有设备")
    public Result<List<Device>> list() {
        return Result.success(deviceService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取设备")
    public Result<Device> getById(@PathVariable Long id) {
        return Result.success(deviceService.findById(id));
    }

    @GetMapping("/zone/{zoneId}")
    @Operation(summary = "获取指定区域的设备")
    public Result<List<Device>> getByZone(@PathVariable Long zoneId) {
        return Result.success(deviceService.findByZone(zoneId));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "按设备类型查询")
    public Result<List<Device>> getByType(@PathVariable DeviceType type) {
        return Result.success(deviceService.findByType(type));
    }

    @PostMapping
    @Operation(summary = "创建设备")
    public Result<Device> create(@RequestBody Device device) {
        return Result.success(deviceService.create(device));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新设备")
    public Result<Device> update(@PathVariable Long id, @RequestBody Device device) {
        return Result.success(deviceService.update(id, device));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "启动设备")
    public Result<String> start(@PathVariable Long id,
                                 @RequestParam(defaultValue = "admin") String userId) {
        return Result.success(deviceService.startDevice(id, userId));
    }

    @PostMapping("/{id}/stop")
    @Operation(summary = "停止设备")
    public Result<String> stop(@PathVariable Long id,
                                @RequestParam(defaultValue = "admin") String userId) {
        return Result.success(deviceService.stopDevice(id, userId));
    }

    @PostMapping("/{id}/adjust")
    @Operation(summary = "调整设备参数")
    public Result<String> adjust(@PathVariable Long id,
                                  @RequestBody Map<String, Object> params,
                                  @RequestParam(defaultValue = "admin") String userId) {
        return Result.success(deviceService.adjustParameter(id, params, userId));
    }

    @PostMapping("/{id}/undo")
    @Operation(summary = "撤销上一条指令")
    public Result<String> undo(@PathVariable Long id) {
        return Result.success(deviceService.undoLastCommand(id));
    }

    @GetMapping("/{id}/detail")
    @Operation(summary = "获取设备详情（含装饰器功能信息）")
    public Result<Map<String, Object>> getDetail(@PathVariable Long id) {
        return Result.success(deviceService.getDeviceDetail(id));
    }
}

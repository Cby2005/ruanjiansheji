package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.chain.ExceptionEvent;
import com.cby.smartfarm.design.chain.impl.*;
import com.cby.smartfarm.design.singleton.CommandQueueManager;
import com.cby.smartfarm.design.singleton.ConfigCenter;
import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.entity.Device;
import com.cby.smartfarm.entity.User;
import com.cby.smartfarm.repository.AlertRecordRepository;
import com.cby.smartfarm.repository.UserRepository;
import com.cby.smartfarm.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 系统控制器
 * 负责系统初始化、健康检查、责任链模式演示
 */
@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
@Tag(name = "系统管理", description = "系统初始化、健康检查、异常事件处理（责任链模式演示）")
public class SystemController {

    private final DeviceService deviceService;
    private final AlertRecordRepository alertRecordRepository;
    private final UserRepository userRepository;

    @PostMapping("/init-devices")
    @Operation(summary = "初始化5个默认设备到数据库")
    public Result<List<Device>> initDevices() {
        return Result.success(deviceService.initDefaultDevices());
    }

    /**
     * 初始化用户数据（代理模式演示用）
     * admin/123456/ADMIN, tech/123456/TECHNICIAN, operator/123456/OPERATOR, viewer/123456/VIEWER
     */
    @PostMapping("/init-users")
    @Operation(summary = "初始化演示用户（代理模式权限控制用）")
    @Transactional
    public Result<List<User>> initUsers() {
        String[][] users = {
                {"admin", "123456", "ADMIN"},
                {"tech", "123456", "TECHNICIAN"},
                {"operator", "123456", "OPERATOR"},
                {"viewer", "123456", "VIEWER"}
        };
        for (String[] u : users) {
            if (!userRepository.existsByUsername(u[0])) {
                User user = new User();
                user.setUsername(u[0]);
                user.setPassword(u[1]);
                user.setRole(u[2]);
                userRepository.save(user);
            }
        }
        return Result.success(userRepository.findAll());
    }

    @GetMapping("/health")
    @Operation(summary = "系统健康检查")
    public Result<Map<String, Object>> health() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("status", "UP");
        info.put("application", "smart-farm-platform");
        info.put("version", "1.0.0");
        return Result.success(info);
    }

    @GetMapping("/singletons")
    @Operation(summary = "Singleton status")
    public Result<Map<String, Object>> singletons() {
        ConfigCenter config = ConfigCenter.getInstance();
        CommandQueueManager queue = CommandQueueManager.getInstance();
        LogRecorder recorder = LogRecorder.getInstance();

        Map<String, Object> info = new LinkedHashMap<>();
        info.put("ConfigCenter", Map.of(
                "soilHumidityMin", config.getSoilHumidityMin(),
                "lightIntensityMin", config.getLightIntensityMin(),
                "co2Max", config.getCo2Max(),
                "airTemperatureMax", config.getAirTemperatureMax(),
                "pestCountMax", config.getPestCountMax()
        ));
        info.put("CommandQueueManager", Map.of("queueSize", queue.size()));
        info.put("LogRecorder", Map.of("recentLogs", recorder.getRecentLogs(8)));
        info.put("description", "ConfigCenter, LogRecorder and CommandQueueManager use singleton pattern.");
        return Result.success(info);
    }

    /**
     * 【责任链模式演示接口】
     * 模拟异常事件，按责任链顺序处理：
     * 本地控制器 → 区域控制器 → 中央平台 → 管理员通知
     */
    @PostMapping("/events/simulate")
    @Operation(summary = "模拟异常事件（责任链模式演示）")
    public Result<Map<String, Object>> simulateEvent(@RequestBody ExceptionEvent event) {
        LocalControllerHandler localHandler = new LocalControllerHandler();
        RegionControllerHandler regionHandler = new RegionControllerHandler();
        CentralPlatformHandler centralHandler = new CentralPlatformHandler(alertRecordRepository);
        AdminNotifyHandler adminHandler = new AdminNotifyHandler();

        localHandler.setNext(regionHandler)
                    .setNext(centralHandler)
                    .setNext(adminHandler);

        localHandler.handle(event);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("事件类型", event.getEventType());
        result.put("事件等级", event.getLevel());
        result.put("事件消息", event.getMessage());
        result.put("是否已处理", event.isHandled());
        result.put("处理链路", event.getProcessLog());
        result.put("说明", "责任链模式：事件按 本地→区域→中央→管理员 顺序传递，由合适的处理器处理");
        return Result.success(result);
    }
}

package com.smartfarm.controller;

import com.smartfarm.common.Result;
import com.smartfarm.entity.FarmZone;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.repository.AlertEventRepository;
import com.smartfarm.repository.DeviceRepository;
import com.smartfarm.repository.FarmZoneRepository;
import com.smartfarm.repository.SensorDataRepository;
import com.smartfarm.pattern.singleton.ConfigCenter;
import com.smartfarm.pattern.singleton.TaskQueue;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "系统仪表盘", description = "系统总览与统计")
public class DashboardController {

    @Autowired
    private FarmZoneRepository farmZoneRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private AlertEventRepository alertEventRepository;

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @GetMapping
    @Operation(summary = "获取系统总览数据")
    public Result<Map<String, Object>> getDashboard() {
        Map<String, Object> dashboard = new LinkedHashMap<>();

        dashboard.put("区域总数", farmZoneRepository.count());
        dashboard.put("设备总数", deviceRepository.count());

        Map<String, Long> deviceByState = deviceRepository.findAll().stream()
                .collect(Collectors.groupingBy(d -> d.getState().getDescription(), Collectors.counting()));
        dashboard.put("设备状态分布", deviceByState);

        dashboard.put("报警总数", alertEventRepository.count());
        dashboard.put("未处理报警", alertEventRepository.findByIsHandledFalse().size());
        dashboard.put("传感器数据条数", sensorDataRepository.count());
        dashboard.put("任务队列大小", TaskQueue.getInstance().getQueueSize());
        dashboard.put("自动控制开关", ConfigCenter.getInstance().get("auto_control.enabled"));

        List<Map<String, Object>> zoneDetails = farmZoneRepository.findAll().stream().map(zone -> {
            Map<String, Object> detail = new LinkedHashMap<>();
            detail.put("id", zone.getId());
            detail.put("name", zone.getName());
            detail.put("type", zone.getType());
            detail.put("设备数", deviceRepository.findByZoneId(zone.getId()).size());
            return detail;
        }).collect(Collectors.toList());
        dashboard.put("区域详情", zoneDetails);

        return Result.success(dashboard);
    }
}

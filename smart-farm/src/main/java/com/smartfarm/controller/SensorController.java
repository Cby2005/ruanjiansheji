package com.smartfarm.controller;

import com.smartfarm.common.Result;
import com.smartfarm.entity.SensorData;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.service.SensorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sensors")
@Tag(name = "传感器数据", description = "传感器数据采集与查询")
public class SensorController {

    @Autowired
    private SensorService sensorService;

    @GetMapping("/types")
    @Operation(summary = "获取所有传感器类型")
    public Result<List<Map<String, String>>> getSensorTypes() {
        List<Map<String, String>> types = Arrays.stream(SensorType.values()).map(t -> {
            Map<String, String> map = new HashMap<>();
            map.put("name", t.name());
            map.put("description", t.getDescription());
            map.put("unit", t.getUnit());
            return map;
        }).collect(Collectors.toList());
        return Result.success(types);
    }

    @GetMapping("/latest")
    @Operation(summary = "获取指定区域和传感器类型的最新数据")
    public Result<SensorData> getLatest(@RequestParam Long zoneId,
                                         @RequestParam SensorType sensorType) {
        return sensorService.getLatest(zoneId, sensorType)
                .map(Result::success)
                .orElse(Result.error("暂无数据"));
    }

    @GetMapping("/history")
    @Operation(summary = "获取传感器历史数据")
    public Result<List<SensorData>> getHistory(@RequestParam Long zoneId,
                                                @RequestParam SensorType sensorType,
                                                @RequestParam(defaultValue = "20") int limit) {
        return Result.success(sensorService.getHistory(zoneId, sensorType, limit));
    }

    @GetMapping("/range")
    @Operation(summary = "按时间范围查询传感器数据")
    public Result<List<SensorData>> getByTimeRange(
            @RequestParam Long zoneId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return Result.success(sensorService.getByTimeRange(zoneId, start, end));
    }

    @PostMapping("/collect")
    @Operation(summary = "手动触发一次传感器数据采集")
    public Result<SensorData> collect(@RequestParam Long zoneId,
                                       @RequestParam SensorType sensorType) {
        return Result.success(sensorService.collectAndSave(zoneId, sensorType));
    }
}

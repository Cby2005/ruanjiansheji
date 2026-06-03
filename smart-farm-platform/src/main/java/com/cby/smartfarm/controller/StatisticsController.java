package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.dto.YieldPredictionRequest;
import com.cby.smartfarm.entity.YieldPrediction;
import com.cby.smartfarm.service.StatisticsService;
import com.cby.smartfarm.service.YieldPredictionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
@Tag(name = "数据统计", description = "系统统计、产量预测、环境分析、设备分析")
public class StatisticsController {

    private final StatisticsService statisticsService;
    private final YieldPredictionService yieldPredictionService;

    @GetMapping("/overview")
    @Operation(summary = "获取系统总览统计")
    public Result<Map<String, Object>> overview() {
        return Result.success(statisticsService.getOverview());
    }

    /**
     * 产量预测
     * 公式：预测产量 = 基础产量 × 环境适宜度 × 农事完成率 × 设备稳定系数
     */
    @PostMapping("/yield-predict")
    @Operation(summary = "产量预测（保存到 yield_prediction 表）")
    public Result<YieldPrediction> predictYield(@Valid @RequestBody YieldPredictionRequest request) {
        YieldPrediction prediction = yieldPredictionService.predict(
                request.getCropName(),
                request.getBaseYield(),
                request.getEnvScore(),
                request.getTaskScore(),
                request.getDeviceScore()
        );
        return Result.success(prediction);
    }

    /**
     * 环境统计：平均土壤湿度、平均空气温度、平均光照强度、平均CO₂、虫情最大值
     */
    @GetMapping("/environment/summary")
    @Operation(summary = "环境数据统计分析")
    public Result<Map<String, Object>> environmentSummary() {
        return Result.success(statisticsService.getEnvironmentSummary());
    }

    /**
     * 设备统计：设备总数、在线设备数、运行中设备数、故障设备数、今日操作次数
     */
    @GetMapping("/devices/summary")
    @Operation(summary = "设备数据统计分析")
    public Result<Map<String, Object>> deviceSummary() {
        return Result.success(statisticsService.getDeviceSummary());
    }
}

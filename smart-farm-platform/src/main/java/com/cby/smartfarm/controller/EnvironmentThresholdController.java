package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.entity.EnvironmentThreshold;
import com.cby.smartfarm.service.EnvironmentThresholdService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/thresholds")
@RequiredArgsConstructor
@Tag(name = "环境阈值配置", description = "系统参数配置：环境阈值、预警等级和处理建议")
public class EnvironmentThresholdController {

    private final EnvironmentThresholdService thresholdService;

    @GetMapping
    @Operation(summary = "查询全部环境阈值配置")
    public Result<List<EnvironmentThreshold>> list() {
        return Result.success(thresholdService.listAll());
    }

    @PostMapping("/init-defaults")
    @Operation(summary = "初始化默认环境阈值")
    public Result<List<EnvironmentThreshold>> initDefaults() {
        return Result.success(thresholdService.initDefaults());
    }

    @PostMapping
    @Operation(summary = "新增或更新环境阈值配置")
    public Result<EnvironmentThreshold> save(@RequestBody EnvironmentThreshold threshold) {
        return Result.success(thresholdService.save(threshold));
    }
}

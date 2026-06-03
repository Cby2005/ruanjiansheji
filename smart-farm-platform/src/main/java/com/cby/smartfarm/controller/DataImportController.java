package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.service.DataImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 数据导入控制器
 * 提供数据集导入接口
 */
@RestController
@RequestMapping("/api/data")
@RequiredArgsConstructor
@Tag(name = "数据导入", description = "数据集导入管理")
public class DataImportController {

    private final DataImportService dataImportService;

    @PostMapping("/import")
    @Operation(summary = "导入所有数据集")
    public Result<Map<String, Object>> importAll() {
        return Result.success(dataImportService.importAll());
    }

    @PostMapping("/import/environment")
    @Operation(summary = "导入环境数据")
    public Result<Map<String, Object>> importEnvironment() {
        return Result.success(dataImportService.importEnvironmentData());
    }

    @PostMapping("/import/crop")
    @Operation(summary = "导入作物推荐数据")
    public Result<Map<String, Object>> importCrop() {
        return Result.success(dataImportService.importCropRecommendation());
    }

    @PostMapping("/import/fertilizer")
    @Operation(summary = "导入施肥建议数据")
    public Result<Map<String, Object>> importFertilizer() {
        return Result.success(dataImportService.importFertilizerAdvice());
    }

    @PostMapping("/import/pest")
    @Operation(summary = "导入害虫类型数据")
    public Result<Map<String, Object>> importPest() {
        return Result.success(dataImportService.importPestType());
    }

    @GetMapping("/stats")
    @Operation(summary = "获取数据导入统计")
    public Result<Map<String, Object>> getStats() {
        return Result.success(dataImportService.getImportStats());
    }
}

package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.EnvironmentRecordRepository;
import com.cby.smartfarm.service.EnvironmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/environment")
@RequiredArgsConstructor
@Tag(name = "环境数据管理", description = "环境数据采集与查询")
public class EnvironmentController {

    private final EnvironmentService environmentService;
    private final EnvironmentRecordRepository environmentRecordRepository;

    @PostMapping("/collect")
    @Operation(summary = "采集环境数据（仅保存，不触发控制）")
    public Result<EnvironmentRecord> collect() {
        return Result.success(environmentService.collect());
    }

    /**
     * 【观察者模式演示接口】
     * 调用后效果：
     * 1. 采集环境数据
     * 2. 将数据交给 EnvironmentDataCenter（被观察者）
     * 3. EnvironmentDataCenter 通知所有观察者
     * 4. 观察者根据阈值自动触发设备控制
     * 5. 自动控制结果写入 device_operation_log
     *
     * Controller 不直接判断阈值，判断逻辑完全在观察者内部
     */
    @PostMapping("/collect-and-control")
    @Operation(summary = "采集环境数据 + 观察者自动控制（观察者模式演示）")
    public Result<Map<String, Object>> collectAndControl() {
        return Result.success(environmentService.collectAndControl());
    }

    @GetMapping("/latest")
    @Operation(summary = "查询最近一次环境数据")
    public Result<EnvironmentRecord> latest() {
        return environmentService.getLatest()
                .map(Result::success)
                .orElse(Result.fail("暂无环境数据"));
    }

    @GetMapping("/list")
    @Operation(summary = "查询所有环境数据")
    public Result<List<EnvironmentRecord>> list() {
        return Result.success(environmentService.listAll());
    }

    @GetMapping("/history")
    @Operation(summary = "分页查询环境历史数据")
    public Result<Page<EnvironmentRecord>> history(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return Result.success(environmentRecordRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "collectTime"))));
    }

    @GetMapping("/trend")
    @Operation(summary = "最近24条环境数据趋势（用于图表）")
    public Result<List<EnvironmentRecord>> trend() {
        return Result.success(environmentRecordRepository.findTop24ByOrderByCollectTimeDesc());
    }
}

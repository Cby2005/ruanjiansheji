package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.entity.FarmTask;
import com.cby.smartfarm.service.FarmTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "农事任务管理", description = "农事任务的创建、分配、状态管理和智能建议")
public class FarmTaskController {

    private final FarmTaskService farmTaskService;

    @PostMapping
    @Operation(summary = "创建任务")
    public Result<FarmTask> create(@RequestBody FarmTask task) {
        return Result.success(farmTaskService.create(task));
    }

    @GetMapping
    @Operation(summary = "查询全部任务")
    public Result<List<FarmTask>> list() {
        return Result.success(farmTaskService.findAll());
    }

    @PutMapping("/{id}/assign")
    @Operation(summary = "分配任务")
    public Result<FarmTask> assign(@PathVariable Long id, @RequestParam String assignee) {
        return Result.success(farmTaskService.assign(id, assignee));
    }

    @PutMapping("/{id}/finish")
    @Operation(summary = "完成任务")
    public Result<FarmTask> finish(@PathVariable Long id) {
        return Result.success(farmTaskService.complete(id));
    }

    @GetMapping("/advice")
    @Operation(summary = "根据作物生长期自动生成建议任务")
    public Result<List<Map<String, String>>> advice(
            @RequestParam String crop,
            @RequestParam String stage) {
        return Result.success(farmTaskService.getAdvice(crop, stage));
    }
}

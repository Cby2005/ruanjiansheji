package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.repository.AlertRecordRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
@Tag(name = "预警管理", description = "环境越界、虫情超标和异常事件预警记录")
public class AlertController {

    private final AlertRecordRepository alertRecordRepository;

    @GetMapping
    @Operation(summary = "查询全部预警记录")
    public Result<List<AlertRecord>> list() {
        return Result.success(alertRecordRepository.findAll());
    }

    @GetMapping("/pending")
    @Operation(summary = "查询未处理预警")
    public Result<List<AlertRecord>> pending() {
        return Result.success(alertRecordRepository.findByHandledFalseOrderByCreateTimeDesc());
    }

    @GetMapping("/stats")
    @Operation(summary = "预警统计（按级别分组）")
    public Result<Map<String, Object>> stats() {
        List<AlertRecord> all = alertRecordRepository.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", all.size());
        stats.put("critical", all.stream().filter(a -> "CRITICAL".equals(a.getAlertLevel()) && !a.getHandled()).count());
        stats.put("warning", all.stream().filter(a -> "WARNING".equals(a.getAlertLevel()) && !a.getHandled()).count());
        stats.put("info", all.stream().filter(a -> "INFO".equals(a.getAlertLevel()) && !a.getHandled()).count());
        stats.put("resolved", all.stream().filter(AlertRecord::getHandled).count());
        return Result.success(stats);
    }

    @PutMapping("/{id}/handle")
    @Transactional
    @Operation(summary = "标记预警已处理")
    public Result<AlertRecord> handle(@PathVariable Long id) {
        AlertRecord alert = alertRecordRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("预警不存在: " + id));
        alert.setHandled(true);
        return Result.success(alertRecordRepository.save(alert));
    }
}

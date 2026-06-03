package com.smartfarm.controller;

import com.smartfarm.common.Result;
import com.smartfarm.entity.AlertEvent;
import com.smartfarm.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "报警管理", description = "报警事件的查询与处理")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    @Operation(summary = "获取所有报警事件")
    public Result<List<AlertEvent>> list() {
        return Result.success(alertService.getAll());
    }

    @GetMapping("/unhandled")
    @Operation(summary = "获取未处理的报警")
    public Result<List<AlertEvent>> unhandled() {
        return Result.success(alertService.getUnhandledAlerts());
    }

    @GetMapping("/zone/{zoneId}")
    @Operation(summary = "按区域分页查询报警")
    public Result<Page<AlertEvent>> byZone(@PathVariable Long zoneId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return Result.success(alertService.getByZone(zoneId, page, size));
    }

    @PostMapping("/{id}/handle")
    @Operation(summary = "处理报警事件")
    public Result<AlertEvent> handle(@PathVariable Long id,
                                      @RequestParam(defaultValue = "admin") String handledBy) {
        return Result.success(alertService.handleAlert(id, handledBy));
    }

    @GetMapping("/count/unhandled")
    @Operation(summary = "获取未处理报警数量")
    public Result<Long> countUnhandled() {
        return Result.success(alertService.countUnhandled());
    }
}

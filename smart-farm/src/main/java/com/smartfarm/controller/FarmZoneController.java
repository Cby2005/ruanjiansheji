package com.smartfarm.controller;

import com.smartfarm.common.Result;
import com.smartfarm.entity.FarmZone;
import com.smartfarm.service.FarmZoneService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@Tag(name = "农场区域管理", description = "农场区域的增删改查")
public class FarmZoneController {

    @Autowired
    private FarmZoneService farmZoneService;

    @GetMapping
    @Operation(summary = "获取所有区域")
    public Result<List<FarmZone>> list() {
        return Result.success(farmZoneService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取区域")
    public Result<FarmZone> getById(@PathVariable Long id) {
        return Result.success(farmZoneService.findById(id));
    }

    @GetMapping("/active")
    @Operation(summary = "获取启用的区域")
    public Result<List<FarmZone>> getActive() {
        return Result.success(farmZoneService.findActive());
    }

    @PostMapping
    @Operation(summary = "创建区域")
    public Result<FarmZone> create(@RequestBody FarmZone zone) {
        return Result.success(farmZoneService.create(zone));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新区域")
    public Result<FarmZone> update(@PathVariable Long id, @RequestBody FarmZone zone) {
        return Result.success(farmZoneService.update(id, zone));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除区域")
    public Result<Void> delete(@PathVariable Long id) {
        farmZoneService.delete(id);
        return Result.success();
    }
}

package com.cby.smartfarm.drone;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.entity.FarmTask;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/drone")
@RequiredArgsConstructor
public class DroneController {
    private final DroneService service;

    @GetMapping("/device/list")
    public Result<Page<DroneDevice>> devices(@RequestParam(required = false) String keyword,
                                             @RequestParam(required = false) String status,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return Result.success(service.listDevices(keyword, status, page, size));
    }

    @PostMapping("/device/add")
    public Result<DroneDevice> addDevice(@RequestBody DroneDevice device) {
        return Result.success(service.saveDevice(device));
    }

    @PutMapping("/device/update")
    public Result<DroneDevice> updateDevice(@RequestBody DroneDevice device) {
        return Result.success(service.saveDevice(device));
    }

    @DeleteMapping("/device/delete/{id}")
    public Result<Void> deleteDevice(@PathVariable Long id) {
        service.deleteDevice(id);
        return Result.success();
    }

    @GetMapping("/point/list")
    public Result<Page<DroneInspectionPoint>> points(@RequestParam(required = false) Long greenhouseId,
                                                     @RequestParam(required = false) String areaName,
                                                     @RequestParam(required = false) String pointType,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "50") int size) {
        return Result.success(service.listPoints(greenhouseId, areaName, pointType, page, size));
    }

    @PostMapping("/point/add")
    public Result<DroneInspectionPoint> addPoint(@RequestBody DroneInspectionPoint point) {
        return Result.success(service.savePoint(point));
    }

    @PutMapping("/point/update")
    public Result<DroneInspectionPoint> updatePoint(@RequestBody DroneInspectionPoint point) {
        return Result.success(service.savePoint(point));
    }

    @DeleteMapping("/point/delete/{id}")
    public Result<Void> deletePoint(@PathVariable Long id) {
        service.deletePoint(id);
        return Result.success();
    }

    @PostMapping("/route/generate")
    public Result<DroneRoutePlan> generateRoute(@Valid @RequestBody RouteGenerateRequest request) {
        return Result.success(service.generateRoute(request));
    }

    @GetMapping("/route/list")
    public Result<Page<DroneRoutePlan>> routes(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "50") int size) {
        return Result.success(service.listRoutes(page, size));
    }

    @GetMapping("/route/{id}")
    public Result<DroneRoutePlan> route(@PathVariable Long id) {
        return Result.success(service.route(id));
    }

    @DeleteMapping("/route/delete/{id}")
    public Result<Void> deleteRoute(@PathVariable Long id) {
        service.deleteRoute(id);
        return Result.success();
    }

    @PostMapping("/task/create")
    public Result<DroneInspectionTask> createTask(@RequestBody DroneInspectionTask task) {
        return Result.success(service.createTask(task));
    }

    @GetMapping("/task/list")
    public Result<Page<DroneInspectionTask>> tasks(@RequestParam(required = false) String status,
                                                   @RequestParam(defaultValue = "0") int page,
                                                   @RequestParam(defaultValue = "50") int size) {
        return Result.success(service.listTasks(status, page, size));
    }

    @GetMapping("/task/{id}")
    public Result<DroneInspectionTask> task(@PathVariable Long id) {
        return Result.success(service.task(id));
    }

    @PostMapping("/task/start/{id}")
    public Result<DroneInspectionTask> startTask(@PathVariable Long id) {
        return Result.success(service.startTask(id));
    }

    @PostMapping("/task/finish/{id}")
    public Result<DroneInspectionTask> finishTask(@PathVariable Long id,
                                                  @RequestParam(required = false) String result) {
        return Result.success(service.finishTask(id, result));
    }

    @PostMapping("/task/cancel/{id}")
    public Result<DroneInspectionTask> cancelTask(@PathVariable Long id) {
        return Result.success(service.cancelTask(id));
    }

    @PostMapping("/image/add")
    public Result<DroneInspectionImage> addImage(@RequestBody DroneInspectionImage image) {
        return Result.success(service.addImage(image));
    }

    @GetMapping("/image/list")
    public Result<Page<DroneInspectionImage>> images(@RequestParam(required = false) Long taskId,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "50") int size) {
        return Result.success(service.listImages(taskId, page, size));
    }

    @PostMapping("/image/detect/{id}")
    public Result<DroneInspectionImage> detectImage(@PathVariable Long id) {
        return Result.success(service.detectImage(id));
    }

    @GetMapping("/report/list")
    public Result<Page<DroneInspectionReport>> reports(@RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "50") int size) {
        return Result.success(service.listReports(page, size));
    }

    @PostMapping("/report/generate/{taskId}")
    public Result<DroneInspectionReport> generateReport(@PathVariable Long taskId) {
        return Result.success(service.generateReport(taskId));
    }

    @GetMapping("/report/{id}")
    public Result<DroneInspectionReport> report(@PathVariable Long id) {
        return Result.success(service.report(id));
    }

    @PostMapping("/task/farm-task/{taskId}")
    public Result<FarmTask> createFarmTask(@PathVariable Long taskId) {
        return Result.success(service.createFarmTask(taskId));
    }
}

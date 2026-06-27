package com.cby.smartfarm.drone;

import com.cby.smartfarm.common.BusinessException;
import com.cby.smartfarm.entity.FarmTask;
import com.cby.smartfarm.service.FarmTaskService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class DroneService implements ApplicationRunner {
    private static final Set<String> POINT_TYPES = Set.of("START", "NORMAL", "ABNORMAL", "END", "KEY", "DISEASE_PRONE");
    private static final Set<String> ROUTE_TYPES = Set.of("DAILY", "DAILY_INSPECTION", "DISEASE_INSPECTION", "ABNORMAL_RECHECK");
    private static final Set<String> ALGORITHMS = Set.of("ORDER", "NEAREST");
    private final DroneDeviceRepository devices;
    private final DroneInspectionPointRepository points;
    private final DroneRoutePlanRepository routes;
    private final DroneInspectionTaskRepository tasks;
    private final DroneInspectionImageRepository images;
    private final DroneInspectionReportRepository reports;
    private final FarmTaskService farmTasks;
    private final ObjectMapper objectMapper;

    public Page<DroneDevice> listDevices(String keyword, String status, int page, int size) {
        return page(devices.findAll().stream()
                .filter(d -> !StringUtils.hasText(keyword)
                        || contains(d.getDroneCode(), keyword) || contains(d.getDroneName(), keyword))
                .filter(d -> !StringUtils.hasText(status) || status.equals(d.getStatus()))
                .toList(), page, size);
    }

    @Transactional
    public DroneDevice saveDevice(DroneDevice input) {
        require(input.getDroneCode(), "无人机编号不能为空");
        require(input.getDroneName(), "无人机名称不能为空");
        DroneDevice target = input.getId() == null ? new DroneDevice() : device(input.getId());
        if (input.getId() == null && devices.existsByDroneCode(input.getDroneCode())) {
            throw new BusinessException("无人机编号已存在");
        }
        target.setDroneCode(input.getDroneCode());
        target.setDroneName(input.getDroneName());
        target.setModel(input.getModel());
        target.setBatteryLevel(input.getBatteryLevel() == null ? 100 : input.getBatteryLevel());
        target.setStatus(StringUtils.hasText(input.getStatus()) ? input.getStatus() : "IDLE");
        target.setCameraStatus(StringUtils.hasText(input.getCameraStatus()) ? input.getCameraStatus() : "NORMAL");
        target.setCurrentX(value(input.getCurrentX()));
        target.setCurrentY(value(input.getCurrentY()));
        target.setCurrentZ(value(input.getCurrentZ()));
        target.setGreenhouseId(input.getGreenhouseId());
        target.setRemark(input.getRemark());
        return devices.save(target);
    }

    public void deleteDevice(Long id) {
        devices.delete(device(id));
    }

    public Page<DroneInspectionPoint> listPoints(Long greenhouseId, String areaName, String pointType, int page, int size) {
        return page(points.findAll().stream()
                .filter(p -> greenhouseId == null || greenhouseId.equals(p.getGreenhouseId()))
                .filter(p -> !StringUtils.hasText(areaName) || contains(p.getAreaName(), areaName))
                .filter(p -> !StringUtils.hasText(pointType) || pointType.equals(p.getPointType()))
                .toList(), page, size);
    }

    @Transactional
    public DroneInspectionPoint savePoint(DroneInspectionPoint input) {
        require(input.getPointName(), "巡检点名称不能为空");
        if (input.getGreenhouseId() == null) throw new BusinessException("请选择所属温室");
        validateCoordinates(input.getLongitude(), input.getLatitude());
        String pointType = StringUtils.hasText(input.getPointType()) ? input.getPointType() : "NORMAL";
        if (!POINT_TYPES.contains(pointType)) throw new BusinessException("点位类型不合法");
        DroneInspectionPoint target = input.getId() == null ? new DroneInspectionPoint() : point(input.getId());
        target.setPointName(input.getPointName());
        target.setGreenhouseId(input.getGreenhouseId());
        target.setAreaName(input.getAreaName());
        target.setX(value(input.getX()));
        target.setY(value(input.getY()));
        double altitude = input.getAltitude() == null ? 1.5D : input.getAltitude();
        target.setZ(altitude);
        target.setLongitude(input.getLongitude());
        target.setLatitude(input.getLatitude());
        target.setAltitude(altitude);
        target.setPointType(pointType);
        target.setRemark(input.getRemark());
        return points.save(target);
    }

    public void deletePoint(Long id) {
        points.delete(point(id));
    }

    @Transactional
    public DroneRoutePlan generateRoute(RouteGenerateRequest request) {
        if (!ROUTE_TYPES.contains(request.routeType())) throw new BusinessException("路径类型不合法");
        if (!ALGORITHMS.contains(request.algorithmType())) throw new BusinessException("路径算法不合法");
        Map<Long, DroneInspectionPoint> pointMap = new LinkedHashMap<>();
        points.findAllById(request.pointIds()).forEach(p -> pointMap.put(p.getId(), p));
        if (pointMap.size() != request.pointIds().size()) {
            throw new BusinessException("部分巡检点不存在");
        }
        List<DroneInspectionPoint> selected = request.pointIds().stream().map(pointMap::get).toList();
        selected.forEach(p -> validateCoordinates(p.getLongitude(), p.getLatitude()));
        DroneInspectionPoint startPoint = selected.stream().filter(p -> "START".equals(p.getPointType())).findFirst().orElse(selected.get(0));
        DroneInspectionPoint endPoint = selected.stream().filter(p -> "END".equals(p.getPointType())).findFirst().orElse(selected.get(selected.size() - 1));
        var start = pathPoint(startPoint);
        var end = pathPoint(endPoint);
        List<DronePathPlanner.Point> inspectionPoints = selected.stream()
                .filter(p -> p != startPoint && p != endPoint)
                .map(DroneService::pathPoint)
                .toList();
        var plan = DronePathPlanner.plan(start, end, inspectionPoints, request.algorithmType());

        DroneRoutePlan route = new DroneRoutePlan();
        route.setRouteCode(code("DR"));
        route.setRouteName(request.routeName());
        route.setGreenhouseId(request.greenhouseId());
        route.setRouteType(request.routeType());
        route.setAlgorithmType(request.algorithmType());
        route.setStartPoint(json(Map.of("longitude", start.longitude(), "latitude", start.latitude(), "altitude", start.altitude())));
        route.setEndPoint(json(Map.of("longitude", end.longitude(), "latitude", end.latitude(), "altitude", end.altitude())));
        List<Map<String, Object>> waypoints = new ArrayList<>();
        for (int i = 0; i < plan.points().size(); i++) {
            var p = plan.points().get(i);
            Map<String, Object> waypoint = new LinkedHashMap<>();
            waypoint.put("pointId", p.id());
            waypoint.put("pointName", p.name());
            waypoint.put("longitude", p.longitude());
            waypoint.put("latitude", p.latitude());
            waypoint.put("altitude", p.altitude());
            waypoint.put("pointType", p.pointType());
            waypoint.put("areaName", p.areaName());
            waypoint.put("remark", p.remark());
            waypoint.put("orderIndex", i + 1);
            waypoints.add(waypoint);
        }
        route.setWaypoints(json(waypoints));
        route.setFlightHeight(start.altitude());
        route.setTotalDistance(plan.distanceMeters());
        route.setEstimatedTime(plan.estimatedSeconds());
        return routes.save(route);
    }

    public Page<DroneRoutePlan> listRoutes(String routeName, String routeType, String algorithmType, int page, int size) {
        return page(routes.findAll().stream()
                .filter(r -> !StringUtils.hasText(routeName) || contains(r.getRouteName(), routeName))
                .filter(r -> !StringUtils.hasText(routeType) || routeType.equals(r.getRouteType()))
                .filter(r -> !StringUtils.hasText(algorithmType) || algorithmType.equals(r.getAlgorithmType()))
                .toList(), page, size);
    }

    public Map<String, Object> routeView(DroneRoutePlan route) {
        Map<String, Object> view = objectMapper.convertValue(route, new TypeReference<>() {});
        try {
            view.put("waypoints", objectMapper.readValue(route.getWaypoints(), new TypeReference<List<Map<String, Object>>>() {}));
            return view;
        } catch (JsonProcessingException e) {
            throw new BusinessException("路径数据解析失败");
        }
    }

    public DroneRoutePlan route(Long id) {
        return routes.findById(id).orElseThrow(() -> new BusinessException("巡检路径不存在"));
    }

    public void deleteRoute(Long id) {
        routes.delete(route(id));
    }

    @Transactional
    public DroneInspectionTask createTask(DroneInspectionTask input) {
        require(input.getTaskName(), "任务名称不能为空");
        device(input.getDroneId());
        route(input.getRouteId());
        input.setId(null);
        input.setTaskCode(code("DT"));
        input.setTaskStatus("PENDING");
        input.setStartTime(null);
        input.setEndTime(null);
        return tasks.save(input);
    }

    public Page<DroneInspectionTask> listTasks(String status, int page, int size) {
        return page(tasks.findAll().stream()
                .filter(t -> !StringUtils.hasText(status) || status.equals(t.getTaskStatus()))
                .toList(), page, size);
    }

    public DroneInspectionTask task(Long id) {
        return tasks.findById(id).orElseThrow(() -> new BusinessException("巡检任务不存在"));
    }

    @Transactional
    public DroneInspectionTask startTask(Long id) {
        DroneInspectionTask task = task(id);
        if (!"PENDING".equals(task.getTaskStatus())) throw new BusinessException("仅待执行任务可以开始");
        DroneDevice drone = device(task.getDroneId());
        route(task.getRouteId());
        if (!"IDLE".equals(drone.getStatus())) throw new BusinessException("无人机当前不可用");
        if (drone.getBatteryLevel() == null || drone.getBatteryLevel() < 20) throw new BusinessException("无人机电量低于20%");
        task.setTaskStatus("RUNNING");
        task.setStartTime(LocalDateTime.now());
        drone.setStatus("RUNNING");
        devices.save(drone);
        return tasks.save(task);
    }

    @Transactional
    public DroneInspectionTask finishTask(Long id, String result) {
        DroneInspectionTask task = task(id);
        if (!"RUNNING".equals(task.getTaskStatus())) throw new BusinessException("仅执行中任务可以完成");
        task.setTaskStatus("FINISHED");
        task.setEndTime(LocalDateTime.now());
        task.setResult(result);
        DroneDevice drone = device(task.getDroneId());
        drone.setStatus("IDLE");
        devices.save(drone);
        return tasks.save(task);
    }

    @Transactional
    public DroneInspectionTask cancelTask(Long id) {
        DroneInspectionTask task = task(id);
        if (!List.of("PENDING", "RUNNING").contains(task.getTaskStatus())) {
            throw new BusinessException("当前状态不可取消");
        }
        if ("RUNNING".equals(task.getTaskStatus())) {
            DroneDevice drone = device(task.getDroneId());
            drone.setStatus("IDLE");
            devices.save(drone);
        }
        task.setTaskStatus("CANCELED");
        task.setEndTime(LocalDateTime.now());
        return tasks.save(task);
    }

    @Transactional
    public DroneInspectionImage addImage(DroneInspectionImage image) {
        task(image.getTaskId());
        require(image.getImageUrl(), "图片地址不能为空");
        image.setId(null);
        image.setDetectResult("PENDING");
        return images.save(image);
    }

    public Page<DroneInspectionImage> listImages(Long taskId, int page, int size) {
        return page(taskId == null ? images.findAll() : images.findByTaskId(taskId), page, size);
    }

    @Transactional
    public DroneInspectionImage detectImage(Long id) {
        DroneInspectionImage image = images.findById(id).orElseThrow(() -> new BusinessException("巡检图片不存在"));
        // ponytail: deterministic demo result; replace here when the trained model HTTP endpoint is deployed.
        if (id % 3 == 0) {
            image.setDetectResult("HEALTHY");
            image.setDiseaseType(null);
            image.setConfidence(0.96);
            image.setSuggestion("长势正常，继续保持当前温湿度管理");
        } else {
            String[] disease = {"灰霉病", "叶斑病", "白粉病"};
            image.setDetectResult("DISEASE");
            image.setDiseaseType(disease[(int) (id % disease.length)]);
            image.setConfidence(0.86 + (id % 8) / 100.0);
            image.setSuggestion("隔离异常植株并安排人工复核，必要时生成植保任务");
        }
        return images.save(image);
    }

    public Page<DroneInspectionReport> listReports(int page, int size) {
        return page(reports.findAll(), page, size);
    }

    public DroneInspectionReport report(Long id) {
        return reports.findById(id).orElseThrow(() -> new BusinessException("巡检报告不存在"));
    }

    @Transactional
    public DroneInspectionReport generateReport(Long taskId) {
        DroneInspectionTask task = task(taskId);
        DroneDevice drone = device(task.getDroneId());
        DroneRoutePlan route = route(task.getRouteId());
        List<DroneInspectionImage> taskImages = images.findByTaskId(taskId);
        Set<String> diseaseTypes = new LinkedHashSet<>();
        Set<String> suggestions = new LinkedHashSet<>();
        taskImages.stream().filter(i -> "DISEASE".equals(i.getDetectResult())).forEach(i -> {
            if (StringUtils.hasText(i.getDiseaseType())) diseaseTypes.add(i.getDiseaseType());
            if (StringUtils.hasText(i.getSuggestion())) suggestions.add(i.getSuggestion());
        });
        DroneInspectionReport report = reports.findByTaskId(taskId).orElseGet(DroneInspectionReport::new);
        report.setTaskId(taskId);
        report.setTaskName(task.getTaskName());
        report.setDroneName(drone.getDroneName());
        report.setRouteName(route.getRouteName());
        report.setInspectionArea("温室" + task.getGreenhouseId());
        report.setStartTime(task.getStartTime());
        report.setEndTime(task.getEndTime());
        report.setTotalImages(taskImages.size());
        report.setAbnormalImages((int) taskImages.stream().filter(i -> "DISEASE".equals(i.getDetectResult())).count());
        report.setDiseaseTypes(String.join("、", diseaseTypes));
        report.setSuggestion(suggestions.isEmpty() ? "未发现明显异常" : String.join("；", suggestions));
        report.setReportTime(LocalDateTime.now());
        return reports.save(report);
    }

    @Transactional
    public FarmTask createFarmTask(Long taskId) {
        DroneInspectionReport report = reports.findByTaskId(taskId).orElseGet(() -> generateReport(taskId));
        if (report.getAbnormalImages() == null || report.getAbnormalImages() == 0) {
            throw new BusinessException("报告没有异常，无需生成农事任务");
        }
        FarmTask farmTask = new FarmTask();
        farmTask.setTaskName("无人机巡检处置-" + report.getTaskName());
        farmTask.setTaskType("打药");
        farmTask.setRemark(report.getDiseaseTypes() + "：" + report.getSuggestion());
        return farmTasks.create(farmTask);
    }

    private DroneDevice device(Long id) {
        if (id == null) throw new BusinessException("请选择无人机");
        return devices.findById(id).orElseThrow(() -> new BusinessException("无人机不存在"));
    }

    private DroneInspectionPoint point(Long id) {
        return points.findById(id).orElseThrow(() -> new BusinessException("巡检点不存在"));
    }

    @Transactional
    public List<DroneInspectionPoint> initDefaultPoints() {
        List<DroneInspectionPoint> existing = new ArrayList<>(points.findAll().stream()
                .sorted(Comparator.comparing(DroneBaseEntity::getId)).toList());
        String[] names = {"起飞点", "A区巡检点", "B区巡检点", "C区异常复核点", "返航点"};
        String[] areas = {"基地入口", "A区", "B区", "C区", "基地入口"};
        String[] types = {"START", "NORMAL", "NORMAL", "ABNORMAL", "END"};
        double[] longitudes = {113.809058, 113.809100, 113.809250, 113.809360, 113.809058};
        double[] latitudes = {34.136323, 34.136420, 34.136500, 34.136380, 34.136323};
        for (int i = 0; i < names.length; i++) {
            DroneInspectionPoint point = i < existing.size() ? existing.get(i) : new DroneInspectionPoint();
            if (point.getLongitude() == null || point.getLatitude() == null) {
                point.setPointName(names[i]);
                point.setGreenhouseId(1L);
                point.setAreaName(areas[i]);
                point.setLongitude(longitudes[i]);
                point.setLatitude(latitudes[i]);
                point.setAltitude(1.5D);
                point.setX(i * 8D);
                point.setY((i % 2 + 1) * 6D);
                point.setZ(1.5D);
                point.setPointType(types[i]);
                point.setRemark(i == 3 ? "草莓病害重点复核区域" : "默认巡检点位");
                points.save(point);
                if (i >= existing.size()) existing.add(point);
            }
        }
        return points.findAll().stream().sorted(Comparator.comparing(DroneBaseEntity::getId)).toList();
    }

    private static DronePathPlanner.Point pathPoint(DroneInspectionPoint point) {
        return new DronePathPlanner.Point(point.getId(), point.getPointName(), point.getLongitude(), point.getLatitude(),
                point.getAltitude() == null ? 1.5D : point.getAltitude(), point.getPointType(), point.getAreaName(), point.getRemark());
    }

    private static void validateCoordinates(Double longitude, Double latitude) {
        if (longitude == null || latitude == null) throw new BusinessException("经纬度不能为空");
        if (longitude < -180 || longitude > 180) throw new BusinessException("经度必须在-180到180之间");
        if (latitude < -90 || latitude > 90) throw new BusinessException("纬度必须在-90到90之间");
    }

    private static boolean contains(String value, String keyword) {
        return value != null && value.toLowerCase().contains(keyword.toLowerCase());
    }

    private static double value(Double value) {
        return value == null ? 0D : value;
    }

    private static void require(String value, String message) {
        if (!StringUtils.hasText(value)) throw new BusinessException(message);
    }

    private static String code(String prefix) {
        return prefix + System.currentTimeMillis();
    }

    private String json(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new BusinessException("路径数据生成失败");
        }
    }

    private static <T extends DroneBaseEntity> Page<T> page(List<T> source, int page, int size) {
        List<T> sorted = source.stream().sorted(Comparator.comparing(DroneBaseEntity::getId).reversed()).toList();
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 200);
        int from = Math.min(safePage * safeSize, sorted.size());
        int to = Math.min(from + safeSize, sorted.size());
        return new PageImpl<>(sorted.subList(from, to), PageRequest.of(safePage, safeSize), sorted.size());
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (devices.count() == 0) {
            DroneDevice drone = new DroneDevice();
            drone.setDroneCode("UAV-ST-001");
            drone.setDroneName("草莓巡检一号");
            drone.setModel("Greenhouse-X1");
            drone.setBatteryLevel(86);
            drone.setGreenhouseId(1L);
            devices.save(drone);
        }
        initDefaultPoints();
    }
}

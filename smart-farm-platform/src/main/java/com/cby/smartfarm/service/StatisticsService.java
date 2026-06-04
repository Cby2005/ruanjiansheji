package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.DeviceOperationLog;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final DeviceRepository deviceRepository;
    private final AlertRecordRepository alertRecordRepository;
    private final FarmTaskRepository farmTaskRepository;
    private final EnvironmentRecordRepository environmentRecordRepository;
    private final DeviceOperationLogRepository deviceOperationLogRepository;

    public Map<String, Object> getOverview() {
        Map<String, Object> stats = new LinkedHashMap<>();
        long total = deviceRepository.count();
        long running = deviceRepository.findByState("RUNNING").size();
        long fault = deviceRepository.findByState("FAULT").size();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        List<DeviceOperationLog> allLogs = deviceOperationLogRepository.findAll();
        long todayOps = allLogs.stream()
                .filter(log -> log.getOperationTime() != null && log.getOperationTime().isAfter(todayStart))
                .count();

        stats.put("deviceTotal", total);
        stats.put("deviceRunning", running);
        stats.put("deviceFault", fault);
        stats.put("todayOperations", todayOps);
        stats.put("onlineDevices", deviceRepository.findByState("STANDBY").size() + running);
        stats.put("pendingAlerts", alertRecordRepository.findByHandledFalseOrderByCreateTimeDesc().size());
        stats.put("pendingTasks", farmTaskRepository.findByStatus("TODO").size());
        stats.put("envDataCount", environmentRecordRepository.count());
        return stats;
    }

    /**
     * 环境统计：平均土壤湿度、平均空气温度、平均光照强度、平均CO₂、虫情最大值
     */
    public Map<String, Object> getEnvironmentSummary() {
        List<EnvironmentRecord> records = environmentRecordRepository.findAll();
        Map<String, Object> summary = new LinkedHashMap<>();

        if (records.isEmpty()) {
            summary.put("提示", "暂无环境数据，请先执行环境采集");
            return summary;
        }

        double avgSoilHumidity = records.stream()
                .filter(r -> r.getSoilHumidity() != null)
                .mapToDouble(EnvironmentRecord::getSoilHumidity)
                .average().orElse(0);
        double avgAirTemp = records.stream()
                .filter(r -> r.getAirTemperature() != null)
                .mapToDouble(EnvironmentRecord::getAirTemperature)
                .average().orElse(0);
        double avgLight = records.stream()
                .filter(r -> r.getLightIntensity() != null)
                .mapToDouble(EnvironmentRecord::getLightIntensity)
                .average().orElse(0);
        double avgCo2 = records.stream()
                .filter(r -> r.getCo2() != null)
                .mapToDouble(EnvironmentRecord::getCo2)
                .average().orElse(0);
        int maxPest = records.stream()
                .filter(r -> r.getPestCount() != null)
                .mapToInt(EnvironmentRecord::getPestCount)
                .max().orElse(0);

        summary.put("数据条数", records.size());
        summary.put("平均土壤湿度(%)", Math.round(avgSoilHumidity * 10.0) / 10.0);
        summary.put("平均空气温度(°C)", Math.round(avgAirTemp * 10.0) / 10.0);
        summary.put("平均光照强度(lux)", Math.round(avgLight * 10.0) / 10.0);
        summary.put("平均CO₂(ppm)", Math.round(avgCo2 * 10.0) / 10.0);
        summary.put("虫情最大值(头)", maxPest);
        return summary;
    }

    /**
     * 设备统计：设备总数、在线设备数、运行中设备数、故障设备数、今日操作次数
     */
    public Map<String, Object> getDeviceSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();

        long total = deviceRepository.count();
        long online = deviceRepository.findAll().stream().filter(d -> Boolean.TRUE.equals(d.getOnline())).count();
        long running = deviceRepository.findByState("RUNNING").size();
        long fault = deviceRepository.findByState("FAULT").size();

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        List<DeviceOperationLog> allLogs = deviceOperationLogRepository.findAll();
        long todayOps = allLogs.stream()
                .filter(log -> log.getOperationTime() != null && log.getOperationTime().isAfter(todayStart))
                .count();

        summary.put("设备总数", total);
        summary.put("在线设备数", online);
        summary.put("运行中设备数", running);
        summary.put("故障设备数", fault);
        summary.put("今日操作次数", todayOps);
        return summary;
    }
}

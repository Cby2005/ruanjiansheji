package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.EnvironmentThreshold;
import com.cby.smartfarm.repository.EnvironmentThresholdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnvironmentThresholdService {

    private final EnvironmentThresholdRepository thresholdRepository;

    public List<EnvironmentThreshold> listAll() {
        return thresholdRepository.findAll();
    }

    @Transactional
    public List<EnvironmentThreshold> initDefaults() {
        createIfAbsent("soilTemperature", "土壤温度", 10.0, 35.0, "WARNING", "检查根区温度，必要时保温或降温");
        createIfAbsent("soilHumidity", "土壤湿度", 45.0, 80.0, "WARNING", "低于阈值时启动灌溉，高于阈值时暂停灌溉并排水");
        createIfAbsent("phValue", "土壤 pH", 5.5, 7.5, "WARNING", "复测土壤酸碱度并执行调理");
        createIfAbsent("ecValue", "土壤 EC", null, 2.5, "WARNING", "降低施肥浓度或清水淋洗");
        createIfAbsent("nutrient", "养分含量", 40.0, null, "WARNING", "生成追肥任务");
        createIfAbsent("airTemperature", "空气温度", 12.0, 32.0, "WARNING", "联动风机、加热器或遮阳设备");
        createIfAbsent("airHumidity", "空气湿度", 45.0, 85.0, "WARNING", "通过通风、雾化或排湿调节");
        createIfAbsent("lightIntensity", "光照强度", 15000.0, 65000.0, "WARNING", "联动补光灯或卷帘遮阳");
        createIfAbsent("co2", "CO2 浓度", 350.0, 1200.0, "WARNING", "低浓度补充 CO2，高浓度加强通风");
        createIfAbsent("windSpeed", "风速", null, 12.0, "ERROR", "强风天气下检查卷帘和棚膜安全");
        createIfAbsent("rainfall", "降雨量", null, 20.0, "WARNING", "检查排水系统和积水风险");
        createIfAbsent("pestCount", "虫情数量", null, 20.0, "ERROR", "生成虫害复查和防治任务");
        return thresholdRepository.findAll();
    }

    @Transactional
    public EnvironmentThreshold save(EnvironmentThreshold threshold) {
        if (threshold.getMetricCode() == null || threshold.getMetricCode().trim().isEmpty()) {
            throw new IllegalArgumentException("metricCode 不能为空");
        }
        thresholdRepository.findByMetricCode(threshold.getMetricCode()).ifPresent(existing -> threshold.setId(existing.getId()));
        return thresholdRepository.save(threshold);
    }

    private void createIfAbsent(String code, String name, Double min, Double max, String level, String suggestion) {
        if (thresholdRepository.existsByMetricCode(code)) {
            return;
        }
        EnvironmentThreshold threshold = new EnvironmentThreshold();
        threshold.setMetricCode(code);
        threshold.setMetricName(name);
        threshold.setMinValue(min);
        threshold.setMaxValue(max);
        threshold.setLevel(level);
        threshold.setSuggestion(suggestion);
        threshold.setEnabled(true);
        thresholdRepository.save(threshold);
    }
}

package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.entity.EnvironmentThreshold;
import com.cby.smartfarm.repository.AlertRecordRepository;
import com.cby.smartfarm.repository.EnvironmentThresholdRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnvironmentAlertService {

    private final EnvironmentThresholdRepository thresholdRepository;
    private final AlertRecordRepository alertRecordRepository;

    @Transactional
    public List<AlertRecord> evaluateAndSave(EnvironmentRecord record) {
        List<AlertRecord> alerts = new ArrayList<>();
        for (EnvironmentThreshold threshold : thresholdRepository.findByEnabledTrue()) {
            Double value = readValue(record, threshold.getMetricCode());
            if (value == null || !isExceeded(value, threshold)) {
                continue;
            }

            AlertRecord alert = new AlertRecord();
            alert.setAlertType("ENV_THRESHOLD_" + threshold.getMetricCode().toUpperCase());
            alert.setAlertLevel(threshold.getLevel());
            alert.setMessage(buildMessage(threshold, value));
            alerts.add(alertRecordRepository.save(alert));
        }
        return alerts;
    }

    private boolean isExceeded(Double value, EnvironmentThreshold threshold) {
        return (threshold.getMinValue() != null && value < threshold.getMinValue())
                || (threshold.getMaxValue() != null && value > threshold.getMaxValue());
    }

    private String buildMessage(EnvironmentThreshold threshold, Double value) {
        String range = "正常范围："
                + (threshold.getMinValue() == null ? "-∞" : threshold.getMinValue())
                + " ~ "
                + (threshold.getMaxValue() == null ? "+∞" : threshold.getMaxValue());
        return threshold.getMetricName() + "异常，当前值 " + value + "，" + range + "。建议：" + threshold.getSuggestion();
    }

    private Double readValue(EnvironmentRecord record, String metricCode) {
        return switch (metricCode) {
            case "soilTemperature" -> record.getSoilTemperature();
            case "soilHumidity" -> record.getSoilHumidity();
            case "phValue" -> record.getPhValue();
            case "ecValue" -> record.getEcValue();
            case "nutrient" -> record.getNutrient();
            case "airTemperature" -> record.getAirTemperature();
            case "airHumidity" -> record.getAirHumidity();
            case "lightIntensity" -> record.getLightIntensity();
            case "co2" -> record.getCo2();
            case "windSpeed" -> record.getWindSpeed();
            case "rainfall" -> record.getRainfall();
            case "pestCount" -> record.getPestCount() == null ? null : record.getPestCount().doubleValue();
            default -> null;
        };
    }
}

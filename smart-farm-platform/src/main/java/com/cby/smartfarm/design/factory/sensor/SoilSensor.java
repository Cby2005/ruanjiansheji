package com.cby.smartfarm.design.factory.sensor;

import com.cby.smartfarm.dto.EnvironmentDataDTO;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 土壤传感器 - 工厂方法模式的具体产品
 * 负责采集土壤温度、土壤湿度、pH、EC、养分
 */
public class SoilSensor implements Sensor {

    @Override
    public String getSensorName() {
        return "土壤传感器";
    }

    @Override
    public EnvironmentDataDTO collect() {
        EnvironmentDataDTO dto = new EnvironmentDataDTO();
        dto.setSoilTemperature(round(15.0, 35.0));
        dto.setSoilHumidity(round(20.0, 80.0));
        dto.setPhValue(round(4.5, 8.5));
        dto.setEcValue(round(0.5, 3.5));
        dto.setNutrient(round(50.0, 300.0));
        return dto;
    }

    private double round(double min, double max) {
        return Math.round(ThreadLocalRandom.current().nextDouble(min, max) * 10.0) / 10.0;
    }
}

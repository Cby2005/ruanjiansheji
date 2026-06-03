package com.cby.smartfarm.design.factory.sensor;

import com.cby.smartfarm.dto.EnvironmentDataDTO;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 气象站传感器 - 工厂方法模式的具体产品
 * 负责采集空气温度、空气湿度、CO₂、风速、降雨量
 */
public class WeatherStationSensor implements Sensor {

    @Override
    public String getSensorName() {
        return "气象站传感器";
    }

    @Override
    public EnvironmentDataDTO collect() {
        EnvironmentDataDTO dto = new EnvironmentDataDTO();
        dto.setAirTemperature(round(10.0, 40.0));
        dto.setAirHumidity(round(30.0, 95.0));
        dto.setCo2(round(300.0, 1500.0));
        dto.setWindSpeed(round(0.0, 15.0));
        dto.setRainfall(round(0.0, 50.0));
        return dto;
    }

    private double round(double min, double max) {
        return Math.round(ThreadLocalRandom.current().nextDouble(min, max) * 10.0) / 10.0;
    }
}

package com.cby.smartfarm.design.factory.sensor;

import com.cby.smartfarm.dto.EnvironmentDataDTO;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 光照传感器 - 工厂方法模式的具体产品
 * 负责采集光照强度
 */
public class LightSensor implements Sensor {

    @Override
    public String getSensorName() {
        return "光照传感器";
    }

    @Override
    public EnvironmentDataDTO collect() {
        EnvironmentDataDTO dto = new EnvironmentDataDTO();
        dto.setLightIntensity(Math.round(ThreadLocalRandom.current().nextDouble(100, 8000) * 10.0) / 10.0);
        return dto;
    }
}

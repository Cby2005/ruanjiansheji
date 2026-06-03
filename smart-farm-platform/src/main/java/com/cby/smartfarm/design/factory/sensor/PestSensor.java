package com.cby.smartfarm.design.factory.sensor;

import com.cby.smartfarm.dto.EnvironmentDataDTO;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 虫情传感器 - 工厂方法模式的具体产品
 * 负责采集虫情数量和害虫类型
 */
public class PestSensor implements Sensor {

    private static final String[] PEST_TYPES = {"蚜虫", "红蜘蛛", "白粉虱", "蓟马", "菜青虫", "无"};

    @Override
    public String getSensorName() {
        return "虫情传感器";
    }

    @Override
    public EnvironmentDataDTO collect() {
        EnvironmentDataDTO dto = new EnvironmentDataDTO();
        int count = ThreadLocalRandom.current().nextInt(0, 50);
        dto.setPestCount(count);
        dto.setPestType(PEST_TYPES[ThreadLocalRandom.current().nextInt(PEST_TYPES.length)]);
        return dto;
    }
}

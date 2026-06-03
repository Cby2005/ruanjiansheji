package com.cby.smartfarm.config;

import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 农场配置中心
 * 集中管理环境阈值等配置参数，体现配置中心思想
 */
@Slf4j
@Getter
@Setter
@Component
public class FarmConfigCenter {

    private double soilHumidityMin = 40;
    private double lightIntensityMin = 300;
    private double co2Max = 1000;
    private double airTemperatureMax = 32;
    private int pestCountMax = 20;

    public FarmConfigCenter() {
        log.info("FarmConfigCenter 初始化完成，阈值: soilHumidityMin={}, lightIntensityMin={}, co2Max={}, airTemperatureMax={}, pestCountMax={}",
                soilHumidityMin, lightIntensityMin, co2Max, airTemperatureMax, pestCountMax);
    }
}

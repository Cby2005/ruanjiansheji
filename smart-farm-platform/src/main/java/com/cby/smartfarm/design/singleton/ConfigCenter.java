package com.cby.smartfarm.design.singleton;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * 配置中心 - 单例模式
 * 保证系统中只有一个配置中心实例，统一管理环境阈值
 *
 * 这里使用单例模式是为了保证配置中心在系统中只有一个实例，
 * 所有模块共享同一份配置数据，避免配置不一致的问题。
 */
@Slf4j
@Getter
public class ConfigCenter {

    private static volatile ConfigCenter instance;

    private double soilHumidityMin = 40;
    private double lightIntensityMin = 300;
    private double co2Max = 1000;
    private double airTemperatureMax = 32;
    private int pestCountMax = 20;

    private ConfigCenter() {
        log.info("ConfigCenter 单例初始化完成");
    }

    public static ConfigCenter getInstance() {
        if (instance == null) {
            synchronized (ConfigCenter.class) {
                if (instance == null) {
                    instance = new ConfigCenter();
                }
            }
        }
        return instance;
    }

    public void setSoilHumidityMin(double val) { this.soilHumidityMin = val; }
    public void setLightIntensityMin(double val) { this.lightIntensityMin = val; }
    public void setCo2Max(double val) { this.co2Max = val; }
    public void setAirTemperatureMax(double val) { this.airTemperatureMax = val; }
    public void setPestCountMax(int val) { this.pestCountMax = val; }
}

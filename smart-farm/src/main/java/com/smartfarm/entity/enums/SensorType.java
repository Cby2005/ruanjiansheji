package com.smartfarm.entity.enums;

import lombok.Getter;

@Getter
public enum SensorType {
    TEMPERATURE("温度传感器", "°C"),
    HUMIDITY("湿度传感器", "%"),
    SOIL_MOISTURE("土壤湿度传感器", "%"),
    LIGHT_INTENSITY("光照强度传感器", "lux"),
    CO2("CO2浓度传感器", "ppm"),
    WATER_LEVEL("水位传感器", "cm"),
    PH("PH值传感器", ""),
    WIND_SPEED("风速传感器", "m/s");

    private final String description;
    private final String unit;

    SensorType(String description, String unit) {
        this.description = description;
        this.unit = unit;
    }
}

package com.smartfarm.entity.enums;

import lombok.Getter;

@Getter
public enum DeviceType {
    IRRIGATION_PUMP("灌溉水泵"),
    GROW_LIGHT("补光灯"),
    VENTILATION_FAN("通风风机"),
    SPRAY_NOZZLE("喷雾喷头"),
    HEATER("加热器"),
    CURTAIN("遮阳帘"),
    FEEDER("自动投喂器");

    private final String description;

    DeviceType(String description) {
        this.description = description;
    }
}

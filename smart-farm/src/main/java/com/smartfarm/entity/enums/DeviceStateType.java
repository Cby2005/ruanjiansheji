package com.smartfarm.entity.enums;

import lombok.Getter;

@Getter
public enum DeviceStateType {
    OFFLINE("离线"),
    IDLE("空闲"),
    RUNNING("运行中"),
    PAUSED("已暂停"),
    ERROR("故障"),
    MAINTENANCE("维护中");

    private final String description;

    DeviceStateType(String description) {
        this.description = description;
    }
}

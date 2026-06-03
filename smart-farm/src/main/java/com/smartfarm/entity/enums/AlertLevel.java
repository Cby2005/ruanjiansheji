package com.smartfarm.entity.enums;

import lombok.Getter;

@Getter
public enum AlertLevel {
    INFO("信息", 1),
    WARNING("警告", 2),
    ERROR("错误", 3),
    CRITICAL("严重", 4);

    private final String description;
    private final int priority;

    AlertLevel(String description, int priority) {
        this.description = description;
        this.priority = priority;
    }
}

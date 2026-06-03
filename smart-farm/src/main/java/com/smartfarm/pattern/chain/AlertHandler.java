package com.smartfarm.pattern.chain;

import com.smartfarm.entity.enums.AlertLevel;

public interface AlertHandler {
    void setNext(AlertHandler next);
    void handle(Long zoneId, AlertLevel level, String title, String detail);
    AlertLevel getSupportedLevel();
}

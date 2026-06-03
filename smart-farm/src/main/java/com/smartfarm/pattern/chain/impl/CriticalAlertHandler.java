package com.smartfarm.pattern.chain.impl;

import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.repository.AlertEventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class CriticalAlertHandler extends AbstractAlertHandler {

    public CriticalAlertHandler(AlertEventRepository alertEventRepository) {
        super(alertEventRepository);
    }

    @Override
    protected void doHandle(Long zoneId, AlertLevel level, String title, String detail) {
        log.error("[CRITICAL] 区域{}: {} - {} 需要立即处理!", zoneId, title, detail);
        saveAlert(zoneId, level, "[严重] " + title, detail);
    }

    @Override
    public AlertLevel getSupportedLevel() {
        return AlertLevel.CRITICAL;
    }
}

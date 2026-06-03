package com.smartfarm.pattern.chain.impl;

import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.repository.AlertEventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class ErrorAlertHandler extends AbstractAlertHandler {

    public ErrorAlertHandler(AlertEventRepository alertEventRepository) {
        super(alertEventRepository);
    }

    @Override
    protected void doHandle(Long zoneId, AlertLevel level, String title, String detail) {
        log.error("[ERROR] 区域{}: {} - {}", zoneId, title, detail);
        saveAlert(zoneId, level, title, detail);
    }

    @Override
    public AlertLevel getSupportedLevel() {
        return AlertLevel.ERROR;
    }
}

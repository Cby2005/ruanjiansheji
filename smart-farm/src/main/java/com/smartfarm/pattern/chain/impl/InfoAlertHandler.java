package com.smartfarm.pattern.chain.impl;

import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.repository.AlertEventRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class InfoAlertHandler extends AbstractAlertHandler {

    public InfoAlertHandler(AlertEventRepository alertEventRepository) {
        super(alertEventRepository);
    }

    @Override
    protected void doHandle(Long zoneId, AlertLevel level, String title, String detail) {
        log.info("[INFO] 区域{}: {} - {}", zoneId, title, detail);
        saveAlert(zoneId, level, title, detail);
    }

    @Override
    public AlertLevel getSupportedLevel() {
        return AlertLevel.INFO;
    }
}

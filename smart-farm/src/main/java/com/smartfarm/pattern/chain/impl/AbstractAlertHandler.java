package com.smartfarm.pattern.chain.impl;

import com.smartfarm.entity.AlertEvent;
import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.pattern.chain.AlertHandler;
import com.smartfarm.pattern.singleton.LoggerManager;
import com.smartfarm.repository.AlertEventRepository;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class AbstractAlertHandler implements AlertHandler {

    private AlertHandler next;
    protected final AlertEventRepository alertEventRepository;

    protected AbstractAlertHandler(AlertEventRepository alertEventRepository) {
        this.alertEventRepository = alertEventRepository;
    }

    @Override
    public void setNext(AlertHandler next) {
        this.next = next;
    }

    @Override
    public void handle(Long zoneId, AlertLevel level, String title, String detail) {
        if (level == getSupportedLevel()) {
            doHandle(zoneId, level, title, detail);
        } else if (next != null) {
            next.handle(zoneId, level, title, detail);
        }
    }

    protected abstract void doHandle(Long zoneId, AlertLevel level, String title, String detail);

    protected void saveAlert(Long zoneId, AlertLevel level, String title, String detail) {
        AlertEvent event = new AlertEvent();
        event.setZoneId(zoneId);
        event.setLevel(level);
        event.setTitle(title);
        event.setDetail(detail);
        alertEventRepository.save(event);
        LoggerManager.getInstance().warn("[" + level.getDescription() + "] " + title + ": " + detail);
    }
}

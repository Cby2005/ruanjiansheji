package com.smartfarm.pattern.chain;

import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.pattern.chain.impl.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;

@Slf4j
@Component
public class AlertHandlerChain {

    @Autowired
    private InfoAlertHandler infoHandler;

    @Autowired
    private WarningAlertHandler warningHandler;

    @Autowired
    private ErrorAlertHandler errorHandler;

    @Autowired
    private CriticalAlertHandler criticalHandler;

    private AlertHandler head;

    @PostConstruct
    public void init() {
        infoHandler.setNext(warningHandler);
        warningHandler.setNext(errorHandler);
        errorHandler.setNext(criticalHandler);
        head = infoHandler;
        log.info("告警责任链初始化完成: INFO -> WARNING -> ERROR -> CRITICAL");
    }

    public void handle(Long zoneId, AlertLevel level, String title, String detail) {
        head.handle(zoneId, level, title, detail);
    }
}

package com.cby.smartfarm.design.chain.impl;

import com.cby.smartfarm.design.chain.EventHandler;
import com.cby.smartfarm.design.chain.ExceptionEvent;
import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.repository.AlertRecordRepository;
import lombok.extern.slf4j.Slf4j;

/**
 * 中央平台处理器 - 责任链模式的第三级
 *
 * 责任链模式用于异常事件分级处理，降低请求发送者与处理者之间的耦合。
 * 处理严重异常（LEVEL: HIGH/CRITICAL），如虫情超标、霜冻、强风、设备过载，
 * 保存预警并通知管理员。
 */
@Slf4j
public class CentralPlatformHandler extends EventHandler {

    private final AlertRecordRepository alertRecordRepository;

    public CentralPlatformHandler(AlertRecordRepository alertRecordRepository) {
        this.alertRecordRepository = alertRecordRepository;
    }

    @Override
    protected boolean canHandle(ExceptionEvent event) {
        return "HIGH".equals(event.getLevel()) || "CRITICAL".equals(event.getLevel());
    }

    @Override
    protected void doHandle(ExceptionEvent event) {
        String msg = "【中央平台】处理严重异常: " + event.getMessage() + " → 保存预警并通知管理员";
        log.info(msg);
        LogRecorder.getInstance().info(msg);

        // 保存预警记录到 alert_record 表
        AlertRecord alert = new AlertRecord();
        alert.setAlertType(event.getEventType());
        alert.setAlertLevel(event.getLevel());
        alert.setMessage(event.getMessage());
        alertRecordRepository.save(alert);

        event.addLog(getHandlerName() + ": 已处理 - 预警已保存，已通知管理员");
        event.setHandled(true);
    }

    @Override
    protected String getHandlerName() {
        return "中央平台(CentralPlatformHandler)";
    }
}

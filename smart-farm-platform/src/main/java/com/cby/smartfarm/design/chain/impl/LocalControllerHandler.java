package com.cby.smartfarm.design.chain.impl;

import com.cby.smartfarm.design.chain.EventHandler;
import com.cby.smartfarm.design.chain.ExceptionEvent;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.List;

/**
 * 本地控制器处理器 - 责任链模式的第一级
 *
 * 责任链模式用于异常事件分级处理，降低请求发送者与处理者之间的耦合。
 * 处理轻微异常（LEVEL: LOW），如短暂通信中断，模拟自动重启通信模块。
 */
@Slf4j
public class LocalControllerHandler extends EventHandler {

    private static final List<String> SUPPORTED_LEVELS = Arrays.asList("LOW");
    private static final List<String> SUPPORTED_TYPES = Arrays.asList(
            "COMM_INTERRUPT", "SENSOR_TIMEOUT", "LINK_FLAP"
    );

    @Override
    protected boolean canHandle(ExceptionEvent event) {
        return SUPPORTED_LEVELS.contains(event.getLevel())
                && SUPPORTED_TYPES.contains(event.getEventType());
    }

    @Override
    protected void doHandle(ExceptionEvent event) {
        String msg = "【本地控制器】处理轻微异常: " + event.getMessage() + " → 模拟自动重启通信模块";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
        event.addLog(getHandlerName() + ": 已处理 - 自动重启通信模块");
        event.setHandled(true);
    }

    @Override
    protected String getHandlerName() {
        return "本地控制器(LocalControllerHandler)";
    }
}

package com.cby.smartfarm.design.chain.impl;

import com.cby.smartfarm.design.chain.EventHandler;
import com.cby.smartfarm.design.chain.ExceptionEvent;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

import java.util.Arrays;
import java.util.List;

/**
 * 区域控制器处理器 - 责任链模式的第二级
 *
 * 责任链模式用于异常事件分级处理，降低请求发送者与处理者之间的耦合。
 * 处理中等级异常（LEVEL: MEDIUM），如传感器离线、执行器故障，
 * 模拟切换备用传感器或备用设备。
 */
@Slf4j
public class RegionControllerHandler extends EventHandler {

    private static final List<String> SUPPORTED_LEVELS = Arrays.asList("LOW", "MEDIUM");
    private static final List<String> SUPPORTED_TYPES = Arrays.asList(
            "SENSOR_OFFLINE", "ACTUATOR_FAULT", "VALVE_STUCK", "COMM_INTERRUPT", "SENSOR_TIMEOUT", "LINK_FLAP"
    );

    @Override
    protected boolean canHandle(ExceptionEvent event) {
        return SUPPORTED_LEVELS.contains(event.getLevel())
                && SUPPORTED_TYPES.contains(event.getEventType());
    }

    @Override
    protected void doHandle(ExceptionEvent event) {
        String msg = "【区域控制器】处理中等级异常: " + event.getMessage() + " → 模拟切换备用设备";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
        event.addLog(getHandlerName() + ": 已处理 - 切换备用设备");
        event.setHandled(true);
    }

    @Override
    protected String getHandlerName() {
        return "区域控制器(RegionControllerHandler)";
    }
}

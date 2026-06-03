package com.cby.smartfarm.design.chain.impl;

import com.cby.smartfarm.design.chain.EventHandler;
import com.cby.smartfarm.design.chain.ExceptionEvent;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 管理员通知处理器 - 责任链模式的最后一级（兜底）
 *
 * 责任链模式用于异常事件分级处理，降低请求发送者与处理者之间的耦合。
 * 作为兜底处理器，无论什么类型的事件，只要前面的处理器都未处理，
 * 最终都会到达这里，通知管理员人工介入。
 */
@Slf4j
public class AdminNotifyHandler extends EventHandler {

    @Override
    protected boolean canHandle(ExceptionEvent event) {
        // 兜底处理器，什么都能接
        return true;
    }

    @Override
    protected void doHandle(ExceptionEvent event) {
        String msg = "【管理员通知】兜底处理: " + event.getMessage() + " → 通知管理员人工介入";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
        event.addLog(getHandlerName() + ": 已处理 - 通知管理员人工介入");
        event.setHandled(true);
    }

    @Override
    protected String getHandlerName() {
        return "管理员通知(AdminNotifyHandler)";
    }
}

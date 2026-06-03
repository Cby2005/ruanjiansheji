package com.cby.smartfarm.design.chain;

import lombok.extern.slf4j.Slf4j;

/**
 * 事件处理器抽象类 - 责任链模式
 *
 * 责任链模式用于异常事件分级处理，降低请求发送者与处理者之间的耦合。
 * 每个处理器持有对下一个处理器的引用，形成一条链。
 * 事件沿链传递，直到被某个处理器处理或到达链尾。
 */
@Slf4j
public abstract class EventHandler {

    private EventHandler next;

    public EventHandler setNext(EventHandler next) {
        this.next = next;
        return next;
    }

    /**
     * 处理事件：当前处理器尝试处理，未处理则传递给下一个
     */
    public void handle(ExceptionEvent event) {
        if (canHandle(event)) {
            doHandle(event);
        } else if (next != null) {
            log.info("【责任链】{} 无法处理，传递给下一级", getHandlerName());
            event.addLog(getHandlerName() + " → 无法处理，传递给下一级");
            next.handle(event);
        } else {
            log.warn("【责任链】所有处理器均未处理事件: {}", event.getEventType());
            event.addLog("责任链末端：所有处理器均未处理");
        }
    }

    protected abstract boolean canHandle(ExceptionEvent event);

    protected abstract void doHandle(ExceptionEvent event);

    protected abstract String getHandlerName();
}

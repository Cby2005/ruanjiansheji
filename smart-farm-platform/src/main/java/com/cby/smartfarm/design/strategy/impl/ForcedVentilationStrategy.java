package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.VentilationStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 强制通风策略 - 策略模式的具体策略
 * 温度过高时强制排风降温
 */
@Slf4j
public class ForcedVentilationStrategy implements VentilationStrategy {

    @Override
    public String getStrategyName() {
        return "强制通风策略";
    }

    @Override
    public void ventilate(String reason) {
        String msg = "【强制通风】原因 " + reason + "：启动排风扇全速运转，强制排风降温";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.VentilationStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 自然通风策略 - 策略模式的具体策略
 * 天气适宜时采用自然通风，节能且温和
 */
@Slf4j
public class NaturalVentilationStrategy implements VentilationStrategy {

    @Override
    public String getStrategyName() {
        return "自然通风策略";
    }

    @Override
    public void ventilate(String reason) {
        String msg = "【自然通风】原因 " + reason + "：开启天窗和侧窗，利用自然风对流";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

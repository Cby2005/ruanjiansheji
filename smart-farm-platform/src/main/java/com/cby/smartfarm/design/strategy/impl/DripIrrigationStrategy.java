package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.IrrigationStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 滴灌策略 - 策略模式的具体策略
 * 适用于番茄等需要精确控水的作物
 */
@Slf4j
public class DripIrrigationStrategy implements IrrigationStrategy {

    @Override
    public String getStrategyName() {
        return "滴灌策略";
    }

    @Override
    public void irrigate(String area) {
        String msg = "【滴灌】区域 " + area + "：启动滴灌系统，流量 2L/h，持续 30 分钟";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

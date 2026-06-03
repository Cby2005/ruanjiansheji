package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.IrrigationStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 喷灌策略 - 策略模式的具体策略
 * 适用于黄瓜等需要均匀灌溉的作物
 */
@Slf4j
public class SprinklerIrrigationStrategy implements IrrigationStrategy {

    @Override
    public String getStrategyName() {
        return "喷灌策略";
    }

    @Override
    public void irrigate(String area) {
        String msg = "【喷灌】区域 " + area + "：启动喷灌系统，覆盖面积大，持续 20 分钟";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

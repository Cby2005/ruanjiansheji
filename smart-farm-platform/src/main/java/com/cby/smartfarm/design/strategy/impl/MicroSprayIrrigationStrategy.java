package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.IrrigationStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 微喷策略 - 策略模式的具体策略
 * 适用于草莓等需要温和灌溉的作物
 */
@Slf4j
public class MicroSprayIrrigationStrategy implements IrrigationStrategy {

    @Override
    public String getStrategyName() {
        return "微喷策略";
    }

    @Override
    public void irrigate(String area) {
        String msg = "【微喷】区域 " + area + "：启动微喷系统，雾化细密，持续 15 分钟";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

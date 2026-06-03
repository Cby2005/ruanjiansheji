package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.VentilationStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 循环通风策略 - 策略模式的具体策略
 * 湿度过高时进行循环除湿
 */
@Slf4j
public class CirculationVentilationStrategy implements VentilationStrategy {

    @Override
    public String getStrategyName() {
        return "循环通风策略";
    }

    @Override
    public void ventilate(String reason) {
        String msg = "【循环通风】原因 " + reason + "：启动内循环风机，均匀气流除湿";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

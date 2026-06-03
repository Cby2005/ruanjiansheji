package com.cby.smartfarm.design.decorator.impl;

import com.cby.smartfarm.design.decorator.DeviceDecorator;
import com.cby.smartfarm.design.decorator.SmartDevice;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 运行时长统计装饰器 - 装饰器模式的具体装饰器
 *
 * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
 * 在设备运行时叠加运行时长统计功能，模拟输出累计运行时长。
 */
@Slf4j
public class RuntimeStatisticsDecorator extends DeviceDecorator {

    public RuntimeStatisticsDecorator(SmartDevice decoratedDevice) {
        super(decoratedDevice);
    }

    @Override
    public void operate() {
        super.operate();
        double hours = Math.round(ThreadLocalRandom.current().nextDouble(1.0, 100.0) * 10.0) / 10.0;
        log.info("【运行时长统计】累计运行: {} 小时", hours);
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + 运行时长统计";
    }

    public double getRuntimeHours() {
        return Math.round(ThreadLocalRandom.current().nextDouble(1.0, 100.0) * 10.0) / 10.0;
    }
}

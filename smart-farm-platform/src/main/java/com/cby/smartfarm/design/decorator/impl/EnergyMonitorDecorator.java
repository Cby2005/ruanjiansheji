package com.cby.smartfarm.design.decorator.impl;

import com.cby.smartfarm.design.decorator.DeviceDecorator;
import com.cby.smartfarm.design.decorator.SmartDevice;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 能耗监测装饰器 - 装饰器模式的具体装饰器
 *
 * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
 * 在设备运行时叠加能耗统计功能，模拟输出本次能耗。
 */
@Slf4j
public class EnergyMonitorDecorator extends DeviceDecorator {

    public EnergyMonitorDecorator(SmartDevice decoratedDevice) {
        super(decoratedDevice);
    }

    @Override
    public void operate() {
        super.operate();
        double energy = Math.round(ThreadLocalRandom.current().nextDouble(0.1, 1.0) * 100.0) / 100.0;
        log.info("【能耗监测】本次能耗: {} kWh", energy);
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + 能耗监测";
    }

    public double getEnergyConsumed() {
        return Math.round(ThreadLocalRandom.current().nextDouble(0.1, 1.0) * 100.0) / 100.0;
    }
}

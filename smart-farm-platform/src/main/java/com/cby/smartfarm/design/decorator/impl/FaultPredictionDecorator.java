package com.cby.smartfarm.design.decorator.impl;

import com.cby.smartfarm.design.decorator.DeviceDecorator;
import com.cby.smartfarm.design.decorator.SmartDevice;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.ThreadLocalRandom;

/**
 * 故障预诊断装饰器 - 装饰器模式的具体装饰器
 *
 * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
 * 在设备运行时叠加故障预诊断功能，模拟输出故障风险等级。
 */
@Slf4j
public class FaultPredictionDecorator extends DeviceDecorator {

    private static final String[] RISK_LEVELS = {"低", "中", "高"};

    public FaultPredictionDecorator(SmartDevice decoratedDevice) {
        super(decoratedDevice);
    }

    @Override
    public void operate() {
        super.operate();
        String risk = RISK_LEVELS[ThreadLocalRandom.current().nextInt(RISK_LEVELS.length)];
        log.info("【故障预诊断】故障风险等级: {}", risk);
    }

    @Override
    public String getDescription() {
        return super.getDescription() + " + 故障预诊断";
    }

    public String getRiskLevel() {
        return RISK_LEVELS[ThreadLocalRandom.current().nextInt(RISK_LEVELS.length)];
    }
}

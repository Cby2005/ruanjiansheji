package com.smartfarm.pattern.decorator.impl;

import com.smartfarm.pattern.decorator.DeviceFunction;
import com.smartfarm.pattern.decorator.DeviceFunctionDecorator;
import com.smartfarm.pattern.singleton.LoggerManager;

import java.util.concurrent.ThreadLocalRandom;

public class EnergyMonitorDecorator extends DeviceFunctionDecorator {

    public EnergyMonitorDecorator(DeviceFunction decoratedFunction) {
        super(decoratedFunction);
    }

    @Override
    public String getDescription() {
        return decoratedFunction.getDescription() + " + 能耗监测";
    }

    @Override
    public double getExtraCost() {
        return decoratedFunction.getExtraCost() + 15.0;
    }

    public double getCurrentPowerConsumption() {
        double power = Math.round(ThreadLocalRandom.current().nextDouble(50.0, 500.0) * 10.0) / 10.0;
        LoggerManager.getInstance().info("能耗监测: 当前功率 " + power + "W");
        return power;
    }

    public double getDailyEnergyUsage() {
        return Math.round(ThreadLocalRandom.current().nextDouble(0.5, 10.0) * 100.0) / 100.0;
    }
}

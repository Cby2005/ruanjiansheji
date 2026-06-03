package com.smartfarm.pattern.decorator.impl;

import com.smartfarm.pattern.decorator.DeviceFunction;
import com.smartfarm.pattern.decorator.DeviceFunctionDecorator;
import com.smartfarm.pattern.singleton.LoggerManager;

import java.util.concurrent.ThreadLocalRandom;

public class RuntimeStatsDecorator extends DeviceFunctionDecorator {

    public RuntimeStatsDecorator(DeviceFunction decoratedFunction) {
        super(decoratedFunction);
    }

    @Override
    public String getDescription() {
        return decoratedFunction.getDescription() + " + 运行时长统计";
    }

    @Override
    public double getExtraCost() {
        return decoratedFunction.getExtraCost() + 10.0;
    }

    public long getTotalRunningHours() {
        return ThreadLocalRandom.current().nextLong(1, 8760);
    }

    public double getAverageDailyRunningHours() {
        double hours = Math.round(ThreadLocalRandom.current().nextDouble(2.0, 18.0) * 10.0) / 10.0;
        LoggerManager.getInstance().info("运行统计: 日均运行 " + hours + " 小时");
        return hours;
    }

    public long getStartCount() {
        return ThreadLocalRandom.current().nextLong(10, 10000);
    }
}

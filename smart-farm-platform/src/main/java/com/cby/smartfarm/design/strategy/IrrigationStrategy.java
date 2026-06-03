package com.cby.smartfarm.design.strategy;

/**
 * 灌溉策略接口 - 策略模式
 * 策略模式用于封装可替换的农业作业算法，避免在控制器中写大量 if-else。
 * 不同灌溉方式（滴灌、喷灌、微喷）实现此接口，运行时可动态切换。
 */
public interface IrrigationStrategy {

    String getStrategyName();

    void irrigate(String area);
}

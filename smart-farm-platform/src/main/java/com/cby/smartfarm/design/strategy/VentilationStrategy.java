package com.cby.smartfarm.design.strategy;

/**
 * 通风策略接口 - 策略模式
 * 根据环境条件选择不同的通风方式
 */
public interface VentilationStrategy {

    String getStrategyName();

    void ventilate(String reason);
}

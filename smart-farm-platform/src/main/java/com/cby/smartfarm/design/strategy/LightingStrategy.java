package com.cby.smartfarm.design.strategy;

/**
 * 补光策略接口 - 策略模式
 * 根据作物生长期选择不同的补光方案
 */
public interface LightingStrategy {

    String getStrategyName();

    void supplementLight(String cropStage);
}

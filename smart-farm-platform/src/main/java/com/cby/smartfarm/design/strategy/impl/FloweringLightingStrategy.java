package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.LightingStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 开花期补光策略 - 策略模式的具体策略
 * 开花期需要红光比例高，促进花芽分化
 */
@Slf4j
public class FloweringLightingStrategy implements LightingStrategy {

    @Override
    public String getStrategyName() {
        return "开花期补光策略";
    }

    @Override
    public void supplementLight(String cropStage) {
        String msg = "【开花期补光】生长期 " + cropStage + "：红光比例 70%，光照 14h/天，强度 300μmol/m²/s";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

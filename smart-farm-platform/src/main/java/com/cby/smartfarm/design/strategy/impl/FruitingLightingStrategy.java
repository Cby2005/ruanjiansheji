package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.LightingStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 结果期补光策略 - 策略模式的具体策略
 * 结果期需要红蓝混合光，促进果实着色和糖分积累
 */
@Slf4j
public class FruitingLightingStrategy implements LightingStrategy {

    @Override
    public String getStrategyName() {
        return "结果期补光策略";
    }

    @Override
    public void supplementLight(String cropStage) {
        String msg = "【结果期补光】生长期 " + cropStage + "：红蓝混合光 1:1，光照 16h/天，强度 400μmol/m²/s";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

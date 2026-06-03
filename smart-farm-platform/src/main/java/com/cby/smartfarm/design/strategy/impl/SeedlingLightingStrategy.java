package com.cby.smartfarm.design.strategy.impl;

import com.cby.smartfarm.design.strategy.LightingStrategy;
import com.cby.smartfarm.design.singleton.LogRecorder;
import lombok.extern.slf4j.Slf4j;

/**
 * 苗期补光策略 - 策略模式的具体策略
 * 苗期需要蓝光比例高，促进茎叶生长
 */
@Slf4j
public class SeedlingLightingStrategy implements LightingStrategy {

    @Override
    public String getStrategyName() {
        return "苗期补光策略";
    }

    @Override
    public void supplementLight(String cropStage) {
        String msg = "【苗期补光】生长期 " + cropStage + "：蓝光比例 60%，光照 12h/天，强度 200μmol/m²/s";
        log.info(msg);
        LogRecorder.getInstance().info(msg);
    }
}

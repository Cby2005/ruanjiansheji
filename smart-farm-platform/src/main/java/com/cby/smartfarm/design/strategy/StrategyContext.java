package com.cby.smartfarm.design.strategy;

import com.cby.smartfarm.design.strategy.impl.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 策略上下文 - 策略模式的核心调度器
 *
 * 策略模式用于封装可替换的农业作业算法，避免在控制器中写大量 if-else。
 * StrategyContext 根据作物类型、生长期、天气条件，动态选择最合适的
 * 灌溉策略、补光策略和通风策略。
 *
 * 示例规则：
 * - 番茄 + 苗期：滴灌 + 苗期补光
 * - 黄瓜 + 开花期：喷灌 + 开花期补光
 * - 草莓 + 结果期：微喷 + 结果期补光
 * - 温度过高：强制通风
 * - 湿度过高：循环通风
 */
@Slf4j
@Component
public class StrategyContext {

    /**
     * 根据作物类型选择灌溉策略
     * 策略模式：将不同作物的灌溉算法封装到独立策略类中
     */
    public IrrigationStrategy resolveIrrigation(String crop) {
        if (crop == null) {
            return new DripIrrigationStrategy();
        }
        return switch (crop.toLowerCase()) {
            case "tomato", "番茄" -> new DripIrrigationStrategy();
            case "cucumber", "黄瓜" -> new SprinklerIrrigationStrategy();
            case "strawberry", "草莓" -> new MicroSprayIrrigationStrategy();
            default -> new DripIrrigationStrategy();
        };
    }

    /**
     * 根据作物生长期选择补光策略
     * 策略模式：将不同生长期的补光算法封装到独立策略类中
     */
    public LightingStrategy resolveLighting(String stage) {
        if (stage == null) {
            return new SeedlingLightingStrategy();
        }
        return switch (stage.toLowerCase()) {
            case "seedling", "苗期" -> new SeedlingLightingStrategy();
            case "flowering", "开花期" -> new FloweringLightingStrategy();
            case "fruiting", "结果期" -> new FruitingLightingStrategy();
            default -> new SeedlingLightingStrategy();
        };
    }

    /**
     * 根据环境条件选择通风策略
     * 策略模式：将不同环境条件的通风算法封装到独立策略类中
     */
    public VentilationStrategy resolveVentilation(String condition) {
        if (condition == null) {
            return new NaturalVentilationStrategy();
        }
        return switch (condition.toLowerCase()) {
            case "high_temp", "温度过高" -> new ForcedVentilationStrategy();
            case "high_humidity", "湿度过高" -> new CirculationVentilationStrategy();
            default -> new NaturalVentilationStrategy();
        };
    }
}

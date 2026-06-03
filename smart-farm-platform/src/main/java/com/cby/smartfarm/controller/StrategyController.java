package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.strategy.IrrigationStrategy;
import com.cby.smartfarm.design.strategy.LightingStrategy;
import com.cby.smartfarm.design.strategy.StrategyContext;
import com.cby.smartfarm.design.strategy.VentilationStrategy;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 策略模式演示控制器
 * 策略模式用于封装可替换的农业作业算法，避免在控制器中写大量 if-else。
 * 通过 StrategyContext 根据作物类型、生长期、天气条件动态选择策略。
 */
@RestController
@RequestMapping("/api/strategy")
@RequiredArgsConstructor
@Tag(name = "策略模式演示", description = "根据作物/生长期/环境条件动态选择灌溉、补光、通风策略")
public class StrategyController {

    private final StrategyContext strategyContext;

    /**
     * 策略模式演示接口
     *
     * 示例：
     * GET /api/strategy/demo?crop=tomato&stage=seedling
     * GET /api/strategy/demo?crop=cucumber&stage=flowering
     * GET /api/strategy/demo?crop=strawberry&stage=fruiting
     * GET /api/strategy/demo?crop=tomato&stage=seedling&condition=high_temp
     */
    @GetMapping("/demo")
    @Operation(summary = "策略模式演示 - 根据作物/生长期选择策略并执行")
    public Result<Map<String, Object>> demo(
            @RequestParam(defaultValue = "tomato") String crop,
            @RequestParam(defaultValue = "seedling") String stage,
            @RequestParam(required = false) String condition) {

        // 根据作物类型选择灌溉策略
        IrrigationStrategy irrigation = strategyContext.resolveIrrigation(crop);
        irrigation.irrigate("A区");

        // 根据生长期选择补光策略
        LightingStrategy lighting = strategyContext.resolveLighting(stage);
        lighting.supplementLight(stage);

        // 根据环境条件选择通风策略
        VentilationStrategy ventilation = strategyContext.resolveVentilation(condition);
        ventilation.ventilate(condition != null ? condition : "常规通风");

        // 组装返回结果
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("作物", crop);
        result.put("生长期", stage);
        result.put("环境条件", condition != null ? condition : "正常");
        result.put("灌溉策略", irrigation.getStrategyName());
        result.put("补光策略", lighting.getStrategyName());
        result.put("通风策略", ventilation.getStrategyName());
        result.put("说明", "策略模式用于封装可替换的农业作业算法，避免在控制器中写大量 if-else");

        return Result.success(result);
    }
}

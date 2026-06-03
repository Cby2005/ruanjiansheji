package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.factory.sensor.Sensor;
import com.cby.smartfarm.design.factory.sensor.SensorFactory;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

/**
 * 传感器控制器
 * 通过工厂方法模式创建不同类型的传感器并采集数据
 */
@RestController
@RequestMapping("/api/sensors")
@Tag(name = "传感器数据采集", description = "通过工厂方法模式创建传感器并模拟采集")
public class SensorController {

    /**
     * 【工厂方法模式】根据传感器类型创建对应传感器并采集数据
     * SensorFactory.createSensor(type) 根据传入的 type 字符串
     * 创建对应的传感器实例（SoilSensor/LightSensor/WeatherStationSensor/PestSensor）
     */
    @GetMapping("/collect/{type}")
    @Operation(summary = "采集指定类型传感器数据")
    public Result<EnvironmentDataDTO> collect(@PathVariable String type) {
        // 工厂方法模式：通过工厂创建具体传感器对象
        Sensor sensor = SensorFactory.createSensor(type);
        EnvironmentDataDTO data = sensor.collect();
        return Result.success(data);
    }
}

package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.factory.actuator.Actuator;
import com.cby.smartfarm.design.factory.actuator.ActuatorFactory;
import com.cby.smartfarm.design.factory.sensor.Sensor;
import com.cby.smartfarm.design.factory.sensor.SensorFactory;
import com.cby.smartfarm.dto.EnvironmentDataDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sensors")
@Tag(name = "Sensor and actuator factory", description = "Factory method demos for sensors and actuators")
public class SensorController {

    @GetMapping("/collect/{type}")
    @Operation(summary = "Collect data by sensor factory")
    public Result<EnvironmentDataDTO> collect(@PathVariable String type) {
        Sensor sensor = SensorFactory.createSensor(type);
        EnvironmentDataDTO data = sensor.collect();
        return Result.success(data);
    }

    @GetMapping("/actuator-demo/{type}")
    @Operation(summary = "Create actuator by factory and execute action")
    public Result<Map<String, Object>> actuatorDemo(@PathVariable String type,
                                                    @RequestParam(defaultValue = "FACTORY-DEMO") String deviceCode,
                                                    @RequestParam(defaultValue = "Factory actuator") String deviceName,
                                                    @RequestParam(defaultValue = "START") String action) {
        Actuator actuator = ActuatorFactory.createActuator(type, deviceCode, deviceName);
        actuator.execute(action);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("pattern", "Factory Method");
        data.put("factory", "ActuatorFactory");
        data.put("type", type);
        data.put("deviceCode", actuator.getDeviceCode());
        data.put("deviceName", actuator.getDeviceName());
        data.put("action", action);
        data.put("message", "Created actuator by type and executed action");
        return Result.success(data);
    }
}

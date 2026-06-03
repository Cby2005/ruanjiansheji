package com.smartfarm.pattern.factory;

import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.pattern.factory.impl.*;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;
import java.util.function.Supplier;

@Component
public class ActuatorFactory {

    private static final Map<DeviceType, Supplier<Actuator>> ACTUATOR_REGISTRY = new EnumMap<>(DeviceType.class);

    static {
        ACTUATOR_REGISTRY.put(DeviceType.IRRIGATION_PUMP, IrrigationPumpActuator::new);
        ACTUATOR_REGISTRY.put(DeviceType.GROW_LIGHT, GrowLightActuator::new);
        ACTUATOR_REGISTRY.put(DeviceType.VENTILATION_FAN, VentilationFanActuator::new);
        ACTUATOR_REGISTRY.put(DeviceType.SPRAY_NOZZLE, SprayNozzleActuator::new);
        ACTUATOR_REGISTRY.put(DeviceType.HEATER, HeaterActuator::new);
        ACTUATOR_REGISTRY.put(DeviceType.CURTAIN, CurtainActuator::new);
    }

    public Actuator createActuator(DeviceType type) {
        Supplier<Actuator> supplier = ACTUATOR_REGISTRY.get(type);
        if (supplier == null) {
            throw new IllegalArgumentException("不支持的执行器类型: " + type);
        }
        return supplier.get();
    }
}

package com.cby.smartfarm.design.factory.sensor;

import com.cby.smartfarm.dto.EnvironmentDataDTO;

/**
 * 传感器接口 - 工厂方法模式的抽象产品
 * 所有传感器类型都实现此接口，通过 SensorFactory 创建具体实例
 */
public interface Sensor {

    String getSensorName();

    EnvironmentDataDTO collect();
}

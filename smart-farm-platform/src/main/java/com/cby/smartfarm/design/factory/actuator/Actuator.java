package com.cby.smartfarm.design.factory.actuator;

/**
 * 执行器接口 - 工厂方法模式的抽象产品
 * 所有执行器设备都实现此接口
 */
public interface Actuator {

    String getDeviceCode();

    String getDeviceName();

    void start();

    void stop();

    void execute(String action);
}

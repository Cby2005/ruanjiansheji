package com.cby.smartfarm.design.decorator;

import lombok.extern.slf4j.Slf4j;

/**
 * 基础智能设备 - 装饰器模式的具体组件
 *
 * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
 * BasicSmartDevice 是最基础的设备，只有最基本的运行能力，
 * 后续通过装饰器动态叠加能耗监测、运行统计、故障预诊断等功能。
 */
@Slf4j
public class BasicSmartDevice implements SmartDevice {

    private final String deviceName;
    private final String deviceCode;

    public BasicSmartDevice(String deviceCode, String deviceName) {
        this.deviceCode = deviceCode;
        this.deviceName = deviceName;
    }

    @Override
    public void operate() {
        log.info("设备 {}({}) 基本运行中", deviceName, deviceCode);
    }

    @Override
    public String getDescription() {
        return "基础设备";
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getDeviceCode() {
        return deviceCode;
    }
}

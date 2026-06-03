package com.cby.smartfarm.design.decorator;

/**
 * 智能设备接口 - 装饰器模式
 *
 * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
 * 所有基础设备和装饰器都实现此接口，
 * 装饰器可以在运行时叠加到设备上，为设备动态增加新能力。
 */
public interface SmartDevice {

    void operate();

    String getDescription();
}

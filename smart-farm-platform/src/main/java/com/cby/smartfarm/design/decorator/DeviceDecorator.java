package com.cby.smartfarm.design.decorator;

/**
 * 设备装饰器抽象类 - 装饰器模式
 *
 * 装饰器模式用于在不修改原有设备类的前提下动态增加功能，符合开闭原则。
 * DeviceDecorator 持有一个 SmartDevice 引用（被装饰对象），
 * 所有方法默认委托给被装饰对象，子类可以重写方法增加新行为。
 */
public abstract class DeviceDecorator implements SmartDevice {

    protected final SmartDevice decoratedDevice;

    protected DeviceDecorator(SmartDevice decoratedDevice) {
        this.decoratedDevice = decoratedDevice;
    }

    @Override
    public void operate() {
        decoratedDevice.operate();
    }

    @Override
    public String getDescription() {
        return decoratedDevice.getDescription();
    }
}

package com.smartfarm.pattern.decorator;

public class BaseDeviceFunction implements DeviceFunction {

    private final String deviceName;

    public BaseDeviceFunction(String deviceName) {
        this.deviceName = deviceName;
    }

    @Override
    public String getDescription() {
        return deviceName + " [基础功能]";
    }

    @Override
    public double getExtraCost() {
        return 0;
    }
}

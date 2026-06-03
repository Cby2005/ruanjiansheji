package com.smartfarm.pattern.decorator;

public abstract class DeviceFunctionDecorator implements DeviceFunction {

    protected final DeviceFunction decoratedFunction;

    protected DeviceFunctionDecorator(DeviceFunction decoratedFunction) {
        this.decoratedFunction = decoratedFunction;
    }

    @Override
    public String getDescription() {
        return decoratedFunction.getDescription();
    }

    @Override
    public double getExtraCost() {
        return decoratedFunction.getExtraCost();
    }
}

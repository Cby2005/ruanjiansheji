package com.smartfarm.pattern.command.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.command.DeviceCommand;
import com.smartfarm.pattern.singleton.LoggerManager;

import java.time.LocalDateTime;

public class StartDeviceCommand implements DeviceCommand {

    private final Device device;

    public StartDeviceCommand(Device device) {
        this.device = device;
    }

    @Override
    public void execute() {
        if (device.getState() == DeviceStateType.ERROR) {
            throw new IllegalStateException("设备故障中，无法启动");
        }
        device.setState(DeviceStateType.RUNNING);
        device.setLastStartedAt(LocalDateTime.now());
        LoggerManager.getInstance().info("设备 [" + device.getName() + "] 已启动");
    }

    @Override
    public void undo() {
        device.setState(DeviceStateType.IDLE);
        LoggerManager.getInstance().info("设备 [" + device.getName() + "] 已停止(撤销)");
    }

    @Override
    public String getCommandName() {
        return "启动设备";
    }
}

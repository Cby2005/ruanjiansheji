package com.smartfarm.pattern.command.impl;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.command.DeviceCommand;
import com.smartfarm.pattern.singleton.LoggerManager;

import java.time.Duration;
import java.time.LocalDateTime;

public class StopDeviceCommand implements DeviceCommand {

    private final Device device;

    public StopDeviceCommand(Device device) {
        this.device = device;
    }

    @Override
    public void execute() {
        if (device.getState() != DeviceStateType.RUNNING) {
            throw new IllegalStateException("设备未在运行中");
        }
        if (device.getLastStartedAt() != null) {
            long minutes = Duration.between(device.getLastStartedAt(), LocalDateTime.now()).toMinutes();
            device.setTotalRunningMinutes(device.getTotalRunningMinutes() + minutes);
        }
        device.setState(DeviceStateType.IDLE);
        LoggerManager.getInstance().info("设备 [" + device.getName() + "] 已停止");
    }

    @Override
    public void undo() {
        device.setState(DeviceStateType.RUNNING);
        device.setLastStartedAt(LocalDateTime.now());
        LoggerManager.getInstance().info("设备 [" + device.getName() + "] 已恢复运行(撤销)");
    }

    @Override
    public String getCommandName() {
        return "停止设备";
    }
}

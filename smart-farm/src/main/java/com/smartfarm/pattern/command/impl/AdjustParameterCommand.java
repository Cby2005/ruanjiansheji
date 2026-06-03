package com.smartfarm.pattern.command.impl;

import com.smartfarm.pattern.command.DeviceCommand;
import com.smartfarm.pattern.singleton.LoggerManager;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;

public class AdjustParameterCommand implements DeviceCommand {

    private final String deviceName;
    private final Map<String, Object> newParams;
    @Getter
    private final Map<String, Object> oldParams = new HashMap<>();

    public AdjustParameterCommand(String deviceName, Map<String, Object> params) {
        this.deviceName = deviceName;
        this.newParams = params;
    }

    @Override
    public void execute() {
        LoggerManager.getInstance().info("设备 [" + deviceName + "] 参数调整: " + newParams);
    }

    @Override
    public void undo() {
        LoggerManager.getInstance().info("设备 [" + deviceName + "] 参数已恢复: " + oldParams);
    }

    @Override
    public String getCommandName() {
        return "调整参数";
    }
}

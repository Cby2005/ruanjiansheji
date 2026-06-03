package com.cby.smartfarm.design.command.impl;

import com.cby.smartfarm.design.command.Command;
import com.cby.smartfarm.design.command.DeviceCommandReceiver;
import lombok.RequiredArgsConstructor;

/**
 * 开启灌溉命令 - 命令模式的具体命令
 * 命令模式用于把设备操作封装成命令对象，支持排队执行和撤销。
 */
@RequiredArgsConstructor
public class OpenIrrigationCommand implements Command {

    private final DeviceCommandReceiver receiver;
    private final String deviceCode;
    private final String operator;

    @Override
    public void execute() {
        receiver.startDevice(deviceCode, operator, "OPEN_IRRIGATION");
    }

    @Override
    public void undo() {
        receiver.undoAction(deviceCode, operator, "OPEN_IRRIGATION");
    }

    @Override
    public String getCommandName() {
        return "开启灌溉(" + deviceCode + ")";
    }
}

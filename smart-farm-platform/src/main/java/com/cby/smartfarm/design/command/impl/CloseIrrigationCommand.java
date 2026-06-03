package com.cby.smartfarm.design.command.impl;

import com.cby.smartfarm.design.command.Command;
import com.cby.smartfarm.design.command.DeviceCommandReceiver;
import lombok.RequiredArgsConstructor;

/**
 * 关闭灌溉命令 - 命令模式的具体命令
 * 命令模式用于把设备操作封装成命令对象，支持排队执行和撤销。
 */
@RequiredArgsConstructor
public class CloseIrrigationCommand implements Command {

    private final DeviceCommandReceiver receiver;
    private final String deviceCode;
    private final String operator;

    @Override
    public void execute() {
        receiver.stopDevice(deviceCode, operator, "CLOSE_IRRIGATION");
    }

    @Override
    public void undo() {
        receiver.undoAction(deviceCode, operator, "CLOSE_IRRIGATION");
    }

    @Override
    public String getCommandName() {
        return "关闭灌溉(" + deviceCode + ")";
    }
}

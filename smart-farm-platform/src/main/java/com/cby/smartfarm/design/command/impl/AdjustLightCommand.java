package com.cby.smartfarm.design.command.impl;

import com.cby.smartfarm.design.command.Command;
import com.cby.smartfarm.design.command.DeviceCommandReceiver;
import lombok.RequiredArgsConstructor;

/**
 * 调节补光灯命令 - 命令模式的具体命令
 * 支持设置亮度参数（如 80 表示 80% 亮度）
 * 命令模式用于把设备操作封装成命令对象，支持排队执行和撤销。
 */
@RequiredArgsConstructor
public class AdjustLightCommand implements Command {

    private final DeviceCommandReceiver receiver;
    private final String deviceCode;
    private final String operator;
    private final String value;

    @Override
    public void execute() {
        receiver.adjustDevice(deviceCode, operator, "ADJUST_LIGHT", value);
    }

    @Override
    public void undo() {
        receiver.undoAction(deviceCode, operator, "ADJUST_LIGHT");
    }

    @Override
    public String getCommandName() {
        return "调节补光灯(" + deviceCode + ", 亮度:" + value + ")";
    }
}

package com.cby.smartfarm.design.command;

/**
 * 命令接口 - 命令模式
 * 命令模式用于把设备操作封装成命令对象，支持排队执行和撤销。
 * 每个具体命令持有对 DeviceCommandReceiver（接收者）的引用，
 * execute() 触发正向操作，undo() 回滚操作。
 */
public interface Command {

    void execute();

    void undo();

    String getCommandName();
}

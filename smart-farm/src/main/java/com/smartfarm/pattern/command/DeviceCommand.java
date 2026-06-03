package com.smartfarm.pattern.command;

public interface DeviceCommand {
    void execute();
    void undo();
    String getCommandName();
}

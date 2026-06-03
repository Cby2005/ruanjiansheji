package com.smartfarm.pattern.proxy;

public interface DeviceAccess {
    String readData(Long deviceId, String userId);
    boolean sendCommand(Long deviceId, String command, String userId);
    String getDeviceStatus(Long deviceId, String userId);
}

package com.smartfarm.pattern.proxy;

import com.smartfarm.pattern.singleton.LoggerManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class RealDeviceAccess implements DeviceAccess {

    @Override
    public String readData(Long deviceId, String userId) {
        log.info("从设备 {} 读取数据", deviceId);
        return "{\"deviceId\": " + deviceId + ", \"status\": \"data_read_success\"}";
    }

    @Override
    public boolean sendCommand(Long deviceId, String command, String userId) {
        log.info("向设备 {} 发送指令: {}", deviceId, command);
        LoggerManager.getInstance().info("指令已下发: 设备" + deviceId + " <- " + command);
        return true;
    }

    @Override
    public String getDeviceStatus(Long deviceId, String userId) {
        log.info("查询设备 {} 状态", deviceId);
        return "{\"deviceId\": " + deviceId + ", \"online\": true}";
    }
}

package com.smartfarm.pattern.proxy;

import com.smartfarm.pattern.singleton.LoggerManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Slf4j
@Component
public class DeviceAccessProxy implements DeviceAccess {

    private static final Set<String> ADMIN_USERS = new HashSet<>(Arrays.asList("admin", "superadmin"));
    private static final Set<String> OPERATOR_USERS = new HashSet<>(Arrays.asList("operator", "farmer"));

    @Autowired
    private RealDeviceAccess realDeviceAccess;

    @Override
    public String readData(Long deviceId, String userId) {
        if (!checkReadPermission(userId)) {
            LoggerManager.getInstance().warn("用户 " + userId + " 无权读取设备 " + deviceId + " 数据");
            throw new SecurityException("用户 " + userId + " 无读取权限");
        }
        log.info("[代理] 用户 {} 读取设备 {} 数据 - 权限通过", userId, deviceId);
        return realDeviceAccess.readData(deviceId, userId);
    }

    @Override
    public boolean sendCommand(Long deviceId, String command, String userId) {
        if (!checkWritePermission(userId)) {
            LoggerManager.getInstance().warn("用户 " + userId + " 无权控制设备 " + deviceId);
            throw new SecurityException("用户 " + userId + " 无控制权限，仅管理员和操作员可控制设备");
        }
        log.info("[代理] 用户 {} 向设备 {} 发送指令 - 权限通过", userId, deviceId);
        return realDeviceAccess.sendCommand(deviceId, command, userId);
    }

    @Override
    public String getDeviceStatus(Long deviceId, String userId) {
        if (!checkReadPermission(userId)) {
            throw new SecurityException("用户 " + userId + " 无查看权限");
        }
        return realDeviceAccess.getDeviceStatus(deviceId, userId);
    }

    private boolean checkReadPermission(String userId) {
        return ADMIN_USERS.contains(userId) || OPERATOR_USERS.contains(userId)
                || userId != null && userId.startsWith("viewer_");
    }

    private boolean checkWritePermission(String userId) {
        return ADMIN_USERS.contains(userId) || OPERATOR_USERS.contains(userId);
    }
}

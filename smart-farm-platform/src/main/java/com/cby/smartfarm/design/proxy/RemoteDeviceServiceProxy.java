package com.cby.smartfarm.design.proxy;

import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.entity.User;
import com.cby.smartfarm.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 远程设备服务代理 - 代理模式的代理对象
 *
 * 代理模式用于在真实设备访问之前增加权限校验和操作审计。
 * 所有设备远程控制请求必须经过本代理，
 * 代理根据用户角色判断是否有权限执行该操作，
 * 权限通过后才调用 RealRemoteDeviceService 真实对象。
 *
 * 权限规则：
 * - ADMIN：可以执行所有操作
 * - TECHNICIAN：可以启动、停止、维护、校准设备
 * - OPERATOR：只能启动、停止设备
 * - VIEWER：只能查看，不能控制设备
 */
@Slf4j
@Component
public class RemoteDeviceServiceProxy implements RemoteDeviceService {

    private final RealRemoteDeviceService realService;
    private final UserRepository userRepository;

    private static final Map<String, List<String>> PERMISSION_MAP = new HashMap<>();

    static {
        PERMISSION_MAP.put("ADMIN", Arrays.asList("START", "STOP", "FAULT", "MAINTAIN", "CALIBRATE"));
        PERMISSION_MAP.put("TECHNICIAN", Arrays.asList("START", "STOP", "MAINTAIN", "CALIBRATE"));
        PERMISSION_MAP.put("OPERATOR", Arrays.asList("START", "STOP"));
        PERMISSION_MAP.put("VIEWER", Arrays.asList());
    }

    public RemoteDeviceServiceProxy(RealRemoteDeviceService realService, UserRepository userRepository) {
        this.realService = realService;
        this.userRepository = userRepository;
    }

    /**
     * 【代理模式】在调用真实对象之前进行权限校验
     * 1. 查找用户
     * 2. 根据角色判断是否有权限执行该操作
     * 3. 权限通过则调用真实对象，否则拒绝
     */
    @Override
    public String controlDevice(String username, String deviceCode, String action) {
        // 第一步：查找用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + username));

        // 第二步：权限校验（代理模式的核心：在真实调用之前增加控制逻辑）
        String role = user.getRole();
        List<String> allowedActions = PERMISSION_MAP.getOrDefault(role, Arrays.asList());

        if (!allowedActions.contains(action.toUpperCase())) {
            String msg = "用户 " + username + "(" + role + ") 无权执行 " + action + " 操作";
            log.warn("【代理模式】权限校验失败: {}", msg);
            LogRecorder.getInstance().warn("代理模式-权限拒绝: " + msg);
            return "权限不足，操作被拒绝。当前角色 " + role + " 只能执行: " + allowedActions;
        }

        // 第三步：权限通过，调用真实对象
        log.info("【代理模式】权限校验通过: {}({}) 执行 {}", username, role, action);
        LogRecorder.getInstance().info("代理模式-权限通过: " + username + "(" + role + ") 执行 " + action);

        return realService.controlDevice(username, deviceCode, action);
    }
}

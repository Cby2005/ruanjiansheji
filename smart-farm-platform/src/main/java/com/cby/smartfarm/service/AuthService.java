package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.User;
import com.cby.smartfarm.repository.UserRepository;
import com.cby.smartfarm.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * 认证服务
 * 处理用户注册和登录逻辑
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    /**
     * 用户注册
     */
    @Transactional
    public Map<String, Object> register(String username, String password, String role) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("用户名已存在: " + username);
        }

        // 验证密码强度
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("密码长度不能少于6位");
        }

        // 验证角色
        if (role == null || role.isEmpty()) {
            role = "VIEWER"; // 默认角色
        }
        if (!isValidRole(role)) {
            throw new IllegalArgumentException("无效的角色: " + role);
        }

        // 创建用户（密码加密存储）
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role.toUpperCase());
        userRepository.save(user);

        // 生成 Token
        String token = jwtUtil.generateToken(username, role);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "注册成功");
        result.put("token", token);
        result.put("user", createUserMap(user));
        log.info("用户注册成功: {}", username);
        return result;
    }

    /**
     * 用户登录
     */
    public Map<String, Object> login(String username, String password) {
        // 查找用户
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + username));

        // 验证密码（使用 BCrypt）
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("密码错误");
        }

        // 生成 Token
        String token = jwtUtil.generateToken(username, user.getRole());

        Map<String, Object> result = new HashMap<>();
        result.put("message", "登录成功");
        result.put("token", token);
        result.put("user", createUserMap(user));
        log.info("用户登录成功: {}", username);
        return result;
    }

    /**
     * 刷新 Token
     */
    public Map<String, Object> refreshToken(String oldToken) {
        try {
            String username = jwtUtil.getUsernameFromToken(oldToken);
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

            String newToken = jwtUtil.generateToken(username, user.getRole());

            Map<String, Object> result = new HashMap<>();
            result.put("token", newToken);
            result.put("user", createUserMap(user));
            return result;
        } catch (Exception e) {
            throw new IllegalArgumentException("Token 无效或已过期");
        }
    }

    /**
     * 修改密码
     */
    @Transactional
    public Map<String, Object> changePassword(String username, String oldPassword, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + username));

        // 验证旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("旧密码错误");
        }

        // 验证新密码强度
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("新密码长度不能少于6位");
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "密码修改成功");
        log.info("用户修改密码成功: {}", username);
        return result;
    }

    /**
     * 获取当前用户信息
     */
    public Map<String, Object> getCurrentUser(String token) {
        String username = jwtUtil.getUsernameFromToken(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        Map<String, Object> result = new HashMap<>();
        result.put("user", createUserMap(user));
        return result;
    }

    private boolean isValidRole(String role) {
        return role.equalsIgnoreCase("ADMIN") ||
               role.equalsIgnoreCase("TECHNICIAN") ||
               role.equalsIgnoreCase("OPERATOR") ||
               role.equalsIgnoreCase("VIEWER");
    }

    private Map<String, Object> createUserMap(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("role", user.getRole());
        return userMap;
    }
}

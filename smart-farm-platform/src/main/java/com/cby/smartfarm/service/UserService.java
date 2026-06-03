package com.cby.smartfarm.service;

import com.cby.smartfarm.entity.User;
import com.cby.smartfarm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 用户管理服务
 * 处理用户CRUD操作
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 获取所有用户列表
     */
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * 根据ID获取用户
     */
    public Map<String, Object> getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + id));
        return convertToMap(user);
    }

    /**
     * 创建用户
     */
    @Transactional
    public Map<String, Object> createUser(String username, String password, String role) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("用户名已存在: " + username);
        }

        // 验证密码强度
        if (password == null || password.length() < 6) {
            throw new IllegalArgumentException("密码长度不能少于6位");
        }

        // 验证角色
        if (!isValidRole(role)) {
            throw new IllegalArgumentException("无效的角色: " + role);
        }

        // 创建用户
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role.toUpperCase());
        userRepository.save(user);

        log.info("管理员创建用户成功: {}", username);
        return convertToMap(user);
    }

    /**
     * 更新用户信息
     */
    @Transactional
    public Map<String, Object> updateUser(Long id, String username, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + id));

        // 检查新用户名是否已存在（如果修改了用户名）
        if (username != null && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new IllegalArgumentException("用户名已存在: " + username);
            }
            user.setUsername(username);
        }

        // 验证并更新角色
        if (role != null && !role.isEmpty()) {
            if (!isValidRole(role)) {
                throw new IllegalArgumentException("无效的角色: " + role);
            }
            user.setRole(role.toUpperCase());
        }

        userRepository.save(user);
        log.info("管理员更新用户信息成功: {}", user.getUsername());
        return convertToMap(user);
    }

    /**
     * 重置用户密码
     */
    @Transactional
    public Map<String, Object> resetPassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + id));

        // 验证新密码强度
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("新密码长度不能少于6位");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "密码重置成功");
        log.info("管理员重置用户密码成功: {}", user.getUsername());
        return result;
    }

    /**
     * 删除用户
     */
    @Transactional
    public Map<String, Object> deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + id));

        userRepository.delete(user);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "用户删除成功");
        log.info("管理员删除用户成功: {}", user.getUsername());
        return result;
    }

    /**
     * 获取用户统计信息
     */
    public Map<String, Object> getUserStats() {
        List<User> users = userRepository.findAll();
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", users.size());
        stats.put("admin", users.stream().filter(u -> "ADMIN".equals(u.getRole())).count());
        stats.put("technician", users.stream().filter(u -> "TECHNICIAN".equals(u.getRole())).count());
        stats.put("operator", users.stream().filter(u -> "OPERATOR".equals(u.getRole())).count());
        stats.put("viewer", users.stream().filter(u -> "VIEWER".equals(u.getRole())).count());
        return stats;
    }

    private boolean isValidRole(String role) {
        return role != null && (
            role.equalsIgnoreCase("ADMIN") ||
            role.equalsIgnoreCase("TECHNICIAN") ||
            role.equalsIgnoreCase("OPERATOR") ||
            role.equalsIgnoreCase("VIEWER")
        );
    }

    private Map<String, Object> convertToMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getId());
        map.put("username", user.getUsername());
        map.put("role", user.getRole());
        return map;
    }
}

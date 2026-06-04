package com.cby.smartfarm.config;

import com.cby.smartfarm.entity.User;
import com.cby.smartfarm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 用户初始化器
 * 创建默认管理员账户
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class UserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("检查默认用户账户...");
        createDefaultUser("admin", "123456", "ADMIN");
        createDefaultUser("tech", "123456", "TECHNICIAN");
        createDefaultUser("operator", "123456", "OPERATOR");
        createDefaultUser("viewer", "123456", "VIEWER");
    }

    private void createDefaultUser(String username, String password, String role) {
        userRepository.findByUsername(username).ifPresentOrElse(
            existing -> {
                // 用户已存在，更新密码为最新值
                existing.setPassword(passwordEncoder.encode(password));
                existing.setRole(role);
                userRepository.save(existing);
                log.info("更新用户密码: {} (角色: {})", username, role);
            },
            () -> {
                User user = new User();
                user.setUsername(username);
                user.setPassword(passwordEncoder.encode(password));
                user.setRole(role);
                userRepository.save(user);
                log.info("创建用户: {} (角色: {})", username, role);
            }
        );
    }
}

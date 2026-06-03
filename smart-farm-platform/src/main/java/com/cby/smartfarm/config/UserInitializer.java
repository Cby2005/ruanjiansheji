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
        // 如果没有管理员用户，创建默认管理员
        if (userRepository.count() == 0) {
            log.info("创建默认用户账户...");
            
            createDefaultUser("admin", "admin123", "ADMIN");
            createDefaultUser("tech", "tech123", "TECHNICIAN");
            createDefaultUser("operator", "operator123", "OPERATOR");
            createDefaultUser("viewer", "viewer123", "VIEWER");
            
            log.info("默认用户账户创建完成");
        }
    }

    private void createDefaultUser(String username, String password, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        userRepository.save(user);
        log.info("创建用户: {} (角色: {})", username, role);
    }
}

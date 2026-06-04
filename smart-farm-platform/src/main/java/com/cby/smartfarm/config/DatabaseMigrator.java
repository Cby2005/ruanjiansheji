package com.cby.smartfarm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * 数据库迁移 - 修复 result 字段长度
 */
@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DatabaseMigrator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE device_operation_log MODIFY COLUMN result VARCHAR(50)");
            log.info("已修复 device_operation_log.result 字段长度为 VARCHAR(50)");
        } catch (Exception e) {
            log.debug("数据库迁移跳过（可能已执行）: {}", e.getMessage());
        }
    }
}

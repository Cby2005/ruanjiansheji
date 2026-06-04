package com.cby.smartfarm.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class DatabaseMigrator implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        executeQuietly("ALTER TABLE device_operation_log MODIFY COLUMN result VARCHAR(1000)",
                "device_operation_log.result 扩容为 VARCHAR(1000)");
        executeQuietly("ALTER TABLE agent_decision_log MODIFY COLUMN commands_json LONGTEXT",
                "agent_decision_log.commands_json 扩容为 LONGTEXT");
    }

    private void executeQuietly(String sql, String message) {
        try {
            jdbcTemplate.execute(sql);
            log.info(message);
        } catch (Exception e) {
            log.debug("数据库迁移跳过: {} ({})", message, e.getMessage());
        }
    }
}

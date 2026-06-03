package com.cby.smartfarm.config;

import com.cby.smartfarm.service.DataImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * 数据自动导入配置
 * 项目启动时自动导入基础数据
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DataImportService dataImportService;

    @Override
    public void run(String... args) {
        // 检查是否需要导入数据（通过检查表是否为空）
        Map<String, Object> stats = dataImportService.getImportStats();
        long totalRecords = 0;
        for (Object value : stats.values()) {
            if (value instanceof Number) {
                totalRecords += ((Number) value).longValue();
            }
        }

        // 如果数据库中没有数据，则自动导入
        if (totalRecords == 0) {
            log.info("检测到数据库为空，开始自动导入基础数据...");
            try {
                Map<String, Object> result = dataImportService.importAll();
                log.info("数据导入完成: {}", result);
            } catch (Exception e) {
                log.error("自动导入数据失败", e);
            }
        } else {
            log.info("数据库中已有 {} 条记录，跳过自动导入", totalRecords);
        }
    }
}

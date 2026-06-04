package com.cby.smartfarm.config;

import com.cby.smartfarm.service.DataImportService;
import com.cby.smartfarm.service.EnvironmentThresholdService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final DataImportService dataImportService;
    private final EnvironmentThresholdService environmentThresholdService;

    @Override
    public void run(String... args) {
        importBaseDataIfEmpty();
        environmentThresholdService.initDefaults();
    }

    private void importBaseDataIfEmpty() {
        Map<String, Object> stats = dataImportService.getImportStats();
        long totalRecords = 0;
        for (Object value : stats.values()) {
            if (value instanceof Number number) {
                totalRecords += number.longValue();
            }
        }

        if (totalRecords > 0) {
            log.info("Database already has {} base records, skip CSV import", totalRecords);
            return;
        }

        try {
            Map<String, Object> result = dataImportService.importAll();
            log.info("Base data imported: {}", result);
        } catch (Exception e) {
            log.error("Base data import failed", e);
        }
    }
}

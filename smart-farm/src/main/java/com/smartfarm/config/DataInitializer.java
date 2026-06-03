package com.smartfarm.config;

import com.smartfarm.entity.FarmZone;
import com.smartfarm.entity.enums.SensorType;
import com.smartfarm.pattern.observer.DataObserver;
import com.smartfarm.pattern.observer.DataSubject;
import com.smartfarm.pattern.observer.impl.AlertDataObserver;
import com.smartfarm.pattern.observer.impl.AutoControlDataObserver;
import com.smartfarm.repository.FarmZoneRepository;
import com.smartfarm.service.DeviceService;
import com.smartfarm.service.SensorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private FarmZoneRepository farmZoneRepository;

    @Autowired
    private DeviceService deviceService;

    @Autowired
    private SensorService sensorService;

    @Autowired
    private DataSubject dataSubject;

    @Autowired
    private AlertDataObserver alertDataObserver;

    @Autowired
    private AutoControlDataObserver autoControlDataObserver;

    @Override
    public void run(String... args) {
        if (farmZoneRepository.count() > 0) {
            log.info("数据库已有数据，跳过初始化");
            return;
        }

        log.info("========== 开始初始化示例数据 ==========");

        FarmZone zone1 = createZone("1号温室大棚", "温室", "番茄、黄瓜种植区", 2000.0);
        FarmZone zone2 = createZone("2号露天菜地", "露天", "叶菜类种植区", 5000.0);
        FarmZone zone3 = createZone("3号智能温室", "温室", "花卉培育区", 1500.0);

        for (Long zoneId : new Long[]{zone1.getId(), zone2.getId(), zone3.getId()}) {
            deviceService.batchCreateDefaultDevices(zoneId);
        }

        for (Long zoneId : new Long[]{zone1.getId(), zone2.getId(), zone3.getId()}) {
            for (SensorType type : SensorType.values()) {
                try {
                    sensorService.collectAndSave(zoneId, type);
                } catch (Exception e) {
                    log.warn("初始化采集跳过: {}-{}", zoneId, type);
                }
            }
        }

        dataSubject.registerObserver(alertDataObserver);
        dataSubject.registerObserver(autoControlDataObserver);

        log.info("========== 示例数据初始化完成 ==========");
        log.info("  区域: 3个");
        log.info("  设备: 每区域{}台", com.smartfarm.entity.enums.DeviceType.values().length);
        log.info("  Swagger: http://localhost:8080/swagger-ui.html");
    }

    private FarmZone createZone(String name, String type, String desc, Double area) {
        FarmZone zone = new FarmZone();
        zone.setName(name);
        zone.setType(type);
        zone.setDescription(desc);
        zone.setAreaSize(area);
        zone.setIsActive(true);
        return farmZoneRepository.save(zone);
    }
}

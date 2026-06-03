package com.smartfarm.pattern.singleton;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class ConfigCenter {

    private static volatile ConfigCenter instance;
    private final Map<String, String> configMap = new ConcurrentHashMap<>();

    private ConfigCenter() {
        configMap.put("temperature.min", "5");
        configMap.put("temperature.max", "40");
        configMap.put("humidity.min", "30");
        configMap.put("humidity.max", "85");
        configMap.put("soil_moisture.min", "30");
        configMap.put("soil_moisture.max", "70");
        configMap.put("light.min", "1000");
        configMap.put("light.max", "5000");
        configMap.put("co2.max", "1500");
        configMap.put("auto_control.enabled", "true");
        log.info("配置中心初始化完成，加载 {} 项配置", configMap.size());
    }

    public static ConfigCenter getInstance() {
        if (instance == null) {
            synchronized (ConfigCenter.class) {
                if (instance == null) {
                    instance = new ConfigCenter();
                }
            }
        }
        return instance;
    }

    public String get(String key) {
        return configMap.getOrDefault(key, "");
    }

    public String get(String key, String defaultValue) {
        return configMap.getOrDefault(key, defaultValue);
    }

    public void set(String key, String value) {
        configMap.put(key, value);
        log.info("配置更新: {} = {}", key, value);
    }

    public Map<String, String> getAll() {
        return Map.copyOf(configMap);
    }
}

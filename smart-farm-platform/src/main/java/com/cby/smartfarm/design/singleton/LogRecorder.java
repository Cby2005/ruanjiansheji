package com.cby.smartfarm.design.singleton;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 日志记录器 - 单例模式
 * 保证系统中只有一个日志记录器实例，统一管理系统日志
 *
 * 这里使用单例模式是为了保证日志记录器在系统中只有一个实例，
 * 所有模块通过同一实例记录日志，确保日志格式统一且不遗漏。
 */
@Slf4j
public class LogRecorder {

    private static volatile LogRecorder instance;
    private final List<String> logHistory = Collections.synchronizedList(new ArrayList<>());
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private LogRecorder() {
    }

    public static LogRecorder getInstance() {
        if (instance == null) {
            synchronized (LogRecorder.class) {
                if (instance == null) {
                    instance = new LogRecorder();
                }
            }
        }
        return instance;
    }

    public void info(String message) {
        String entry = "[" + LocalDateTime.now().format(FMT) + "] [INFO] " + message;
        log.info(entry);
        logHistory.add(entry);
    }

    public void warn(String message) {
        String entry = "[" + LocalDateTime.now().format(FMT) + "] [WARN] " + message;
        log.warn(entry);
        logHistory.add(entry);
    }

    public void error(String message) {
        String entry = "[" + LocalDateTime.now().format(FMT) + "] [ERROR] " + message;
        log.error(entry);
        logHistory.add(entry);
    }

    public List<String> getRecentLogs(int count) {
        int size = logHistory.size();
        int from = Math.max(0, size - count);
        return new ArrayList<>(logHistory.subList(from, size));
    }
}

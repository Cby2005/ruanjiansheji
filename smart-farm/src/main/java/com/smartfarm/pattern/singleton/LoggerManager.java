package com.smartfarm.pattern.singleton;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class LoggerManager {

    private static volatile LoggerManager instance;
    private final List<LogEntry> recentLogs = Collections.synchronizedList(new ArrayList<>());
    private static final int MAX_LOGS = 500;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private LoggerManager() {
    }

    public static LoggerManager getInstance() {
        if (instance == null) {
            synchronized (LoggerManager.class) {
                if (instance == null) {
                    instance = new LoggerManager();
                }
            }
        }
        return instance;
    }

    public void info(String message) {
        addLog("INFO", message);
    }

    public void warn(String message) {
        addLog("WARN", message);
    }

    public void error(String message) {
        addLog("ERROR", message);
    }

    private void addLog(String level, String message) {
        LogEntry entry = new LogEntry(LocalDateTime.now().format(FMT), level, message);
        recentLogs.add(entry);
        if (recentLogs.size() > MAX_LOGS) {
            recentLogs.subList(0, recentLogs.size() - MAX_LOGS).clear();
        }
    }

    public List<LogEntry> getRecentLogs(int count) {
        int size = recentLogs.size();
        int from = Math.max(0, size - count);
        return new ArrayList<>(recentLogs.subList(from, size));
    }

    public List<LogEntry> getAllLogs() {
        return new ArrayList<>(recentLogs);
    }

    public static class LogEntry {
        public final String timestamp;
        public final String level;
        public final String message;

        public LogEntry(String timestamp, String level, String message) {
            this.timestamp = timestamp;
            this.level = level;
            this.message = message;
        }
    }
}

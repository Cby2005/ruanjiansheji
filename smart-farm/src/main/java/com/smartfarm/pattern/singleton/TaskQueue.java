package com.smartfarm.pattern.singleton;

import com.smartfarm.entity.enums.DeviceType;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;

@Slf4j
public class TaskQueue {

    private static volatile TaskQueue instance;
    private final BlockingQueue<TaskItem> queue = new LinkedBlockingQueue<>();
    private final List<TaskItem> history = new ArrayList<>();

    private TaskQueue() {
    }

    public static TaskQueue getInstance() {
        if (instance == null) {
            synchronized (TaskQueue.class) {
                if (instance == null) {
                    instance = new TaskQueue();
                }
            }
        }
        return instance;
    }

    public void submit(String taskName, DeviceType deviceType, Long zoneId) {
        TaskItem item = new TaskItem(taskName, deviceType, zoneId);
        queue.offer(item);
        synchronized (history) {
            history.add(item);
            if (history.size() > 200) {
                history.subList(0, history.size() - 200).clear();
            }
        }
        log.info("任务入队: {}", taskName);
    }

    public TaskItem poll() {
        return queue.poll();
    }

    public int getQueueSize() {
        return queue.size();
    }

    public List<TaskItem> getHistory(int count) {
        synchronized (history) {
            int size = history.size();
            int from = Math.max(0, size - count);
            return new ArrayList<>(history.subList(from, size));
        }
    }

    @Getter
    public static class TaskItem {
        private final String taskName;
        private final DeviceType deviceType;
        private final Long zoneId;
        private final String createdAt;

        public TaskItem(String taskName, DeviceType deviceType, Long zoneId) {
            this.taskName = taskName;
            this.deviceType = deviceType;
            this.zoneId = zoneId;
            this.createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }
    }
}

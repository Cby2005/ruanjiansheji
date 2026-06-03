package com.smartfarm.pattern.command;

import com.smartfarm.entity.DeviceCommandLog;
import com.smartfarm.entity.Device;
import com.smartfarm.repository.DeviceCommandLogRepository;
import com.smartfarm.repository.DeviceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.Deque;

@Slf4j
@Component
public class CommandInvoker {

    @Autowired
    private DeviceCommandLogRepository commandLogRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    private final Deque<DeviceCommand> history = new ArrayDeque<>();

    public String executeCommand(DeviceCommand command, Long deviceId) {
        long start = System.currentTimeMillis();
        String result;
        String feedback;

        try {
            command.execute();
            history.push(command);
            result = "SUCCESS";
            feedback = command.getCommandName() + " 执行成功";
            log.info("指令执行成功: {}", command.getCommandName());
        } catch (Exception e) {
            result = "FAILED";
            feedback = "执行失败: " + e.getMessage();
            log.error("指令执行失败: {}", command.getCommandName(), e);
        }

        long duration = System.currentTimeMillis() - start;
        saveLog(deviceId, command.getCommandName(), result, feedback, duration);
        return feedback;
    }

    public String undoLastCommand(Long deviceId) {
        if (history.isEmpty()) {
            return "没有可撤销的指令";
        }
        DeviceCommand last = history.pop();
        long start = System.currentTimeMillis();
        try {
            last.undo();
            saveLog(deviceId, "UNDO:" + last.getCommandName(), "SUCCESS", "撤销成功",
                    System.currentTimeMillis() - start);
            return "已撤销: " + last.getCommandName();
        } catch (Exception e) {
            saveLog(deviceId, "UNDO:" + last.getCommandName(), "FAILED", e.getMessage(),
                    System.currentTimeMillis() - start);
            return "撤销失败: " + e.getMessage();
        }
    }

    private void saveLog(Long deviceId, String commandName, String result,
                         String feedback, long duration) {
        DeviceCommandLog cmdLog = new DeviceCommandLog();
        cmdLog.setDeviceId(deviceId);
        cmdLog.setCommandName(commandName);
        cmdLog.setResult(result);
        cmdLog.setFeedback(feedback);
        cmdLog.setDurationMs(duration);
        cmdLog.setExecutedAt(LocalDateTime.now());
        commandLogRepository.save(cmdLog);
    }
}

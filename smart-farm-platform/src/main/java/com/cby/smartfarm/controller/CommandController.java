package com.cby.smartfarm.controller;

import com.cby.smartfarm.common.Result;
import com.cby.smartfarm.design.command.Command;
import com.cby.smartfarm.design.command.DeviceCommandReceiver;
import com.cby.smartfarm.design.command.impl.*;
import com.cby.smartfarm.design.singleton.CommandQueueManager;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 设备指令控制器 - 命令模式演示
 *
 * 命令模式用于把设备操作封装成命令对象，支持排队执行和撤销。
 * Controller 只负责根据参数创建对应的命令对象并放入队列，
 * 真正的执行逻辑在命令对象和 DeviceCommandReceiver 中。
 */
@RestController
@RequestMapping("/api/commands")
@RequiredArgsConstructor
@Tag(name = "设备指令控制", description = "命令模式演示：设备操作封装为命令对象，支持排队和撤销")
public class CommandController {

    private final DeviceCommandReceiver receiver;

    /**
     * 添加命令到队列
     * 命令模式：根据 commandType 创建对应的命令对象，放入 CommandQueueManager 队列
     */
    @PostMapping("/add")
    @Operation(summary = "添加命令到队列")
    public Result<Map<String, Object>> addCommand(
            @RequestParam String deviceCode,
            @RequestParam String commandType,
            @RequestParam(defaultValue = "system") String operator,
            @RequestParam(required = false) String value) {

        CommandQueueManager manager = CommandQueueManager.getInstance();

        // 根据 commandType 创建对应的命令对象（命令模式）
        Command command = createCommand(deviceCode, commandType, operator, value);
        manager.addCommand(command);

        Map<String, Object> result = new HashMap<>();
        result.put("已添加命令", command.getCommandName());
        result.put("当前队列长度", manager.size());
        return Result.success(result);
    }

    /**
     * 执行队列中所有命令
     * 命令模式：CommandQueueManager.executeAll() 依次执行队列中所有命令
     */
    @PostMapping("/execute-all")
    @Operation(summary = "执行队列中所有命令")
    public Result<Map<String, Object>> executeAll() {
        CommandQueueManager manager = CommandQueueManager.getInstance();
        List<String> results = manager.executeAll();

        Map<String, Object> result = new HashMap<>();
        result.put("执行结果", results);
        result.put("说明", "命令模式：队列中所有命令已依次执行，操作日志已写入");
        return Result.success(result);
    }

    /**
     * 撤销上一条已执行的命令
     * 命令模式：CommandQueueManager.undoLast() 撤销最后执行的命令
     */
    @PostMapping("/undo-last")
    @Operation(summary = "撤销上一条已执行的命令")
    public Result<Map<String, Object>> undoLast() {
        CommandQueueManager manager = CommandQueueManager.getInstance();
        String resultMsg = manager.undoLast();

        Map<String, Object> result = new HashMap<>();
        result.put("撤销结果", resultMsg);
        result.put("说明", "命令模式：undo() 会回滚设备状态并写入操作日志");
        return Result.success(result);
    }

    @GetMapping("/queue-status")
    @Operation(summary = "Command queue status")
    public Result<Map<String, Object>> queueStatus() {
        CommandQueueManager manager = CommandQueueManager.getInstance();
        Map<String, Object> result = new HashMap<>();
        result.put("queueSize", manager.size());
        result.put("pattern", "Singleton + Command");
        result.put("description", "CommandQueueManager is a singleton command queue.");
        return Result.success(result);
    }

    /**
     * 根据命令类型创建对应的命令对象
     * 命令模式：将不同设备操作封装为独立的命令类
     */
    private Command createCommand(String deviceCode, String commandType, String operator, String value) {
        return switch (commandType.toUpperCase()) {
            case "OPEN_IRRIGATION" -> new OpenIrrigationCommand(receiver, deviceCode, operator);
            case "CLOSE_IRRIGATION" -> new CloseIrrigationCommand(receiver, deviceCode, operator);
            case "START_FAN" -> new StartFanCommand(receiver, deviceCode, operator);
            case "STOP_FAN" -> new StopFanCommand(receiver, deviceCode, operator);
            case "ADJUST_LIGHT" -> new AdjustLightCommand(receiver, deviceCode, operator, value != null ? value : "50");
            case "LIFT_ROLLER" -> new LiftRollerCommand(receiver, deviceCode, operator);
            case "LOWER_ROLLER" -> new LowerRollerCommand(receiver, deviceCode, operator);
            default -> throw new IllegalArgumentException("不支持的命令类型: " + commandType);
        };
    }
}

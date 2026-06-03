package com.cby.smartfarm.design.singleton;

import com.cby.smartfarm.design.command.Command;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * 命令队列管理器 - 单例模式
 * 保证系统中只有一个命令队列管理器实例，统一管理设备命令
 *
 * 这里使用单例模式是为了保证任务队列在系统中只有一个实例，
 * 所有设备命令通过同一队列管理，避免命令丢失或重复执行。
 */
@Slf4j
public class CommandQueueManager {

    private static volatile CommandQueueManager instance;
    private final Deque<Command> commandQueue = new ArrayDeque<>();
    private final Deque<Command> executedStack = new ArrayDeque<>();

    private CommandQueueManager() {
    }

    public static CommandQueueManager getInstance() {
        if (instance == null) {
            synchronized (CommandQueueManager.class) {
                if (instance == null) {
                    instance = new CommandQueueManager();
                }
            }
        }
        return instance;
    }

    public void addCommand(Command command) {
        commandQueue.addLast(command);
        log.info("命令入队: {}", command.getCommandName());
    }

    public List<String> executeAll() {
        List<String> results = new ArrayList<>();
        while (!commandQueue.isEmpty()) {
            Command cmd = commandQueue.pollFirst();
            cmd.execute();
            executedStack.addLast(cmd);
            results.add("已执行: " + cmd.getCommandName());
            log.info("队列命令已执行: {}", cmd.getCommandName());
        }
        return results;
    }

    public String undoLast() {
        if (executedStack.isEmpty()) {
            log.warn("已执行命令栈为空，无法撤销");
            return "无可撤销的命令";
        }
        Command cmd = executedStack.pollLast();
        cmd.undo();
        log.info("队列末尾命令已撤销: {}", cmd.getCommandName());
        return "已撤销: " + cmd.getCommandName();
    }

    public int size() {
        return commandQueue.size();
    }
}

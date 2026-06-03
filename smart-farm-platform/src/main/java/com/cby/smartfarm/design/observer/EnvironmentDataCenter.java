package com.cby.smartfarm.design.observer;

import com.cby.smartfarm.entity.EnvironmentRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * 环境数据中心 - 观察者模式的被观察者（Subject）
 *
 * 【观察者模式】EnvironmentDataCenter 是被观察者，维护一个观察者列表。
 * 当环境数据采集完成后，由本类统一通知所有已注册的观察者。
 * 观察者根据阈值自动判断是否触发设备控制或预警。
 *
 * 好处：新增监控规则时只需新增一个 Observer 实现类并注册，
 * 无需修改采集逻辑或控制器代码，符合开闭原则。
 */
@Slf4j
@Component
public class EnvironmentDataCenter {

    private final List<EnvironmentObserver> observers = new CopyOnWriteArrayList<>();

    public void registerObserver(EnvironmentObserver observer) {
        observers.add(observer);
        log.info("【观察者模式】注册观察者: {}", observer.getObserverName());
    }

    public void removeObserver(EnvironmentObserver observer) {
        observers.remove(observer);
        log.info("【观察者模式】移除观察者: {}", observer.getObserverName());
    }

    /**
     * 通知所有观察者：环境数据已更新
     * 【观察者模式】遍历观察者列表，依次调用 update() 方法
     */
    public List<String> notifyObservers(EnvironmentRecord record) {
        List<String> allActions = new ArrayList<>();
        for (EnvironmentObserver observer : observers) {
            try {
                observer.update(record);
                allActions.addAll(observer.getTriggeredActions());
            } catch (Exception e) {
                log.error("【观察者模式】观察者 {} 处理异常: {}", observer.getObserverName(), e.getMessage());
            }
        }
        return allActions;
    }

    public List<EnvironmentObserver> getObservers() {
        return new ArrayList<>(observers);
    }
}

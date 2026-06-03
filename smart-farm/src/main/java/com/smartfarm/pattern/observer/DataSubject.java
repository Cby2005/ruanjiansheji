package com.smartfarm.pattern.observer;

import com.smartfarm.entity.SensorData;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Component
public class DataSubject {

    private final List<DataObserver> observers = new CopyOnWriteArrayList<>();

    public void registerObserver(DataObserver observer) {
        observers.add(observer);
        log.info("注册观察者: {}", observer.getObserverName());
    }

    public void removeObserver(DataObserver observer) {
        observers.remove(observer);
        log.info("移除观察者: {}", observer.getObserverName());
    }

    public void notifyObservers(SensorData data) {
        log.debug("通知 {} 个观察者, 传感器类型: {}, 值: {}",
                observers.size(), data.getSensorType(), data.getValue());
        for (DataObserver observer : observers) {
            try {
                observer.onDataChanged(data);
            } catch (Exception e) {
                log.error("观察者 {} 处理异常: {}", observer.getObserverName(), e.getMessage());
            }
        }
    }
}

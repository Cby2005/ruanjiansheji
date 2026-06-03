package com.cby.smartfarm.design.observer;

import com.cby.smartfarm.entity.EnvironmentRecord;
import java.util.List;

/**
 * 观察者接口 - 观察者模式
 * 【观察者模式】定义了环境数据变化时的回调契约。
 * 所有需要响应环境变化的组件都实现此接口，
 * 由 EnvironmentDataCenter（被观察者）在数据更新时统一通知。
 */
public interface EnvironmentObserver {

    void update(EnvironmentRecord record);

    String getObserverName();

    List<String> getTriggeredActions();
}

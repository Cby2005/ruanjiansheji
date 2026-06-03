package com.smartfarm.pattern.observer;

import com.smartfarm.entity.SensorData;

public interface DataObserver {
    void onDataChanged(SensorData data);
    String getObserverName();
}

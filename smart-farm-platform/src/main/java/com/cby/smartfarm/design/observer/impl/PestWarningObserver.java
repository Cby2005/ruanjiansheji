package com.cby.smartfarm.design.observer.impl;

import com.cby.smartfarm.config.FarmConfigCenter;
import com.cby.smartfarm.design.observer.EnvironmentObserver;
import com.cby.smartfarm.design.singleton.LogRecorder;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.repository.AlertRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 虫情预警观察者 - 观察者模式的具体观察者
 *
 * 【观察者模式】当虫情数量超过阈值时，自动生成虫情预警记录。
 * Controller 不直接判断阈值，判断逻辑完全在此观察者内部。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PestWarningObserver implements EnvironmentObserver {

    private final FarmConfigCenter configCenter;
    private final AlertRecordRepository alertRecordRepository;

    private final List<String> actions = new ArrayList<>();

    @Override
    public void update(EnvironmentRecord record) {
        actions.clear();
        if (record.getPestCount() != null &&
                record.getPestCount() > configCenter.getPestCountMax()) {

            String msg = "虫情数量 " + record.getPestCount() + "头 超过阈值 "
                    + configCenter.getPestCountMax() + "头，类型: " + record.getPestType();
            log.info("【观察者模式-PestWarningObserver】{}", msg);
            LogRecorder.getInstance().info("虫情预警观察者: " + msg);

            // 生成预警记录
            AlertRecord alert = new AlertRecord();
            alert.setAlertType("PEST_EXCEEDED");
            alert.setAlertLevel("ERROR");
            alert.setMessage("虫情超标：" + record.getPestCount() + "头，害虫类型: " + record.getPestType());
            alertRecordRepository.save(alert);

            actions.add("虫情预警观察者: " + msg);
        }
    }

    @Override
    public String getObserverName() {
        return "虫情预警观察者(PestWarningObserver)";
    }

    @Override
    public List<String> getTriggeredActions() {
        return new ArrayList<>(actions);
    }
}

package com.smartfarm.service;

import com.smartfarm.entity.AlertEvent;
import com.smartfarm.entity.enums.AlertLevel;
import com.smartfarm.repository.AlertEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AlertService {

    @Autowired
    private AlertEventRepository alertEventRepository;

    public List<AlertEvent> getUnhandledAlerts() {
        return alertEventRepository.findByIsHandledFalseOrderByCreatedAtDesc();
    }

    public Page<AlertEvent> getByZone(Long zoneId, int page, int size) {
        return alertEventRepository.findByZoneId(zoneId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public List<AlertEvent> getAll() {
        return alertEventRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @Transactional
    public AlertEvent handleAlert(Long alertId, String handledBy) {
        AlertEvent alert = alertEventRepository.findById(alertId)
                .orElseThrow(() -> new IllegalArgumentException("告警不存在: " + alertId));
        alert.setIsHandled(true);
        alert.setHandledBy(handledBy);
        alert.setHandledAt(LocalDateTime.now());
        return alertEventRepository.save(alert);
    }

    public long countUnhandled() {
        return alertEventRepository.findByIsHandledFalse().size();
    }
}

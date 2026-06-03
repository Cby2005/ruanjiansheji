package com.smartfarm.repository;

import com.smartfarm.entity.AlertEvent;
import com.smartfarm.entity.enums.AlertLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertEventRepository extends JpaRepository<AlertEvent, Long> {
    List<AlertEvent> findByIsHandledFalse();
    List<AlertEvent> findByLevel(AlertLevel level);
    Page<AlertEvent> findByZoneId(Long zoneId, Pageable pageable);
    List<AlertEvent> findByIsHandledFalseOrderByCreatedAtDesc();
}

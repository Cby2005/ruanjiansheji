package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.AlertRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRecordRepository extends JpaRepository<AlertRecord, Long> {

    List<AlertRecord> findByHandledFalseOrderByCreateTimeDesc();

    List<AlertRecord> findByAlertLevel(String alertLevel);
}

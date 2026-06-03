package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.EnvironmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnvironmentRecordRepository extends JpaRepository<EnvironmentRecord, Long> {

    Optional<EnvironmentRecord> findTopByOrderByCollectTimeDesc();
}

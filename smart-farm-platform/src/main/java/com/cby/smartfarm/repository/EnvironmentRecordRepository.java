package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.EnvironmentRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EnvironmentRecordRepository extends JpaRepository<EnvironmentRecord, Long> {

    Optional<EnvironmentRecord> findTopByOrderByCollectTimeDesc();

    List<EnvironmentRecord> findTop24ByOrderByCollectTimeDesc();

    @Query("SELECT e FROM EnvironmentRecord e WHERE e.collectTime BETWEEN :startDate AND :endDate")
    Page<EnvironmentRecord> findByCollectTimeBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);
}

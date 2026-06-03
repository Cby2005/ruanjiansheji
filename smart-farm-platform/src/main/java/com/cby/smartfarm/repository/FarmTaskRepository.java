package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.FarmTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FarmTaskRepository extends JpaRepository<FarmTask, Long> {

    List<FarmTask> findByStatus(String status);

    List<FarmTask> findByAssignee(String assignee);
}

package com.cby.smartfarm.repository;

import com.cby.smartfarm.entity.AgentDecisionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgentDecisionLogRepository extends JpaRepository<AgentDecisionLog, Long> {

    List<AgentDecisionLog> findTop50ByOrderByCreateTimeDesc();

    List<AgentDecisionLog> findByWorkflowIdOrderByCreateTimeAsc(String workflowId);
}

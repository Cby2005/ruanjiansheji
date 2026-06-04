package com.cby.smartfarm.agent.dto;

import com.cby.smartfarm.entity.AgentDecisionLog;
import com.cby.smartfarm.entity.AlertRecord;
import com.cby.smartfarm.entity.EnvironmentRecord;
import com.cby.smartfarm.dto.KnowledgeGraphResult;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Schema(description = "多 Agent 协作决策完整流程结果")
public class AgentWorkflowResult {

    private String workflowId;

    private List<String> pipeline = new ArrayList<>();

    private EnvironmentRecord environmentRecord;

    private AgentDecisionPlan decisionPlan;

    private AgentSafetyReview safetyReview;

    private List<AgentControlCommand> commands = new ArrayList<>();

    private List<AgentExecutionResult> executionResults = new ArrayList<>();

    private List<AlertRecord> alerts = new ArrayList<>();

    private List<AgentDecisionLog> decisionLogs = new ArrayList<>();

    private KnowledgeGraphResult knowledgeGraph;
}

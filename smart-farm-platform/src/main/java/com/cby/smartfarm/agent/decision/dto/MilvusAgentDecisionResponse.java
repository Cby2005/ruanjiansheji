package com.cby.smartfarm.agent.decision.dto;

import com.cby.smartfarm.rag.dto.KgEvidenceDTO;
import com.cby.smartfarm.rag.dto.RagSearchResultDTO;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class MilvusAgentDecisionResponse {
    private String riskLevel;
    private String summary;
    private List<AgentStepDTO> agentSteps = new ArrayList<>();
    private List<String> suggestions = new ArrayList<>();
    private List<RagSearchResultDTO> ragEvidence = new ArrayList<>();
    private List<KgEvidenceDTO> kgEvidence = new ArrayList<>();
    private String ragWarning;
    private String pesticideSafetyNotice = "具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。";
}

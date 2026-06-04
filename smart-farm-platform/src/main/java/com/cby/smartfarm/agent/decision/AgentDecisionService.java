package com.cby.smartfarm.agent.decision;

import com.cby.smartfarm.agent.decision.dto.AgentStepDTO;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionRequest;
import com.cby.smartfarm.agent.decision.dto.MilvusAgentDecisionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgentDecisionService {

    private final EnvironmentAgent environmentAgent;
    private final PestDiseaseAgent pestDiseaseAgent;
    private final AgronomyKnowledgeAgent agronomyKnowledgeAgent;
    private final PesticideSafetyAgent pesticideSafetyAgent;
    private final FinalDecisionAgent finalDecisionAgent;

    public MilvusAgentDecisionResponse decide(MilvusAgentDecisionRequest request) {
        MilvusAgentDecisionResponse response = new MilvusAgentDecisionResponse();
        List<String> riskHints = environmentAgent.riskHints(request);
        AgentStepDTO envStep = environmentAgent.analyze(request);
        PestDiseaseAgent.Result pestResult = pestDiseaseAgent.analyze(request);
        AgronomyKnowledgeAgent.Result ragResult = agronomyKnowledgeAgent.analyze(request);
        AgentStepDTO pesticideStep = pesticideSafetyAgent.analyze(request);
        FinalDecisionAgent.Result finalResult = finalDecisionAgent.decide(request, riskHints, !pestResult.evidence().isEmpty());

        response.setRiskLevel(finalResult.riskLevel());
        response.setSummary(finalResult.summary());
        response.setSuggestions(finalResult.suggestions());
        response.setKgEvidence(pestResult.evidence());
        response.setRagEvidence(ragResult.searchResponse().getResults());
        response.setRagWarning(ragResult.searchResponse().getWarning());
        response.setPesticideSafetyNotice(PesticideSafetyAgent.NOTICE);
        response.setAgentSteps(List.of(
                envStep,
                pestResult.step(),
                ragResult.step(),
                pesticideStep,
                finalResult.step()
        ));
        return response;
    }
}

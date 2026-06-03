package com.cby.smartfarm.agent;

import com.cby.smartfarm.agent.dto.AgentFinding;

public interface AgricultureAgent {

    AgentFinding analyze(AgentContext context);
}

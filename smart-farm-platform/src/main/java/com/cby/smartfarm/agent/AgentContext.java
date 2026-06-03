package com.cby.smartfarm.agent;

import com.cby.smartfarm.dto.EnvironmentDataDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AgentContext {

    private final String crop;
    private final String growthStage;
    private final String scenario;
    private final EnvironmentDataDTO environment;
}

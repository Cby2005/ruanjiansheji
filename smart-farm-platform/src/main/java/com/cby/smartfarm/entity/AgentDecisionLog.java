package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "agent_decision_log")
@Schema(description = "Agent 决策日志")
public class AgentDecisionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workflow_id", nullable = false, length = 64)
    @Schema(description = "本次决策流程ID")
    private String workflowId;

    @Column(name = "agent_name", nullable = false, length = 100)
    @Schema(description = "Agent 名称")
    private String agentName;

    @Column(name = "stage", nullable = false, length = 50)
    @Schema(description = "流程阶段")
    private String stage;

    @Column(name = "risk_level", length = 20)
    @Schema(description = "风险等级")
    private String riskLevel;

    @Column(name = "input_summary", length = 1000)
    @Schema(description = "输入摘要")
    private String inputSummary;

    @Column(name = "output_summary", length = 2000)
    @Schema(description = "输出摘要")
    private String outputSummary;

    @Column(name = "safety_approved")
    @Schema(description = "安全审核是否通过")
    private Boolean safetyApproved;

    @Lob
    @Column(name = "commands_json", columnDefinition = "LONGTEXT")
    @Schema(description = "生成或执行的命令 JSON")
    private String commandsJson;

    @Column(name = "create_time")
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @PrePersist
    public void prePersist() {
        if (createTime == null) {
            createTime = LocalDateTime.now();
        }
    }
}

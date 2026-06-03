package com.cby.smartfarm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "农场任务请求")
public class FarmTaskRequest {

    @NotBlank(message = "任务名称不能为空")
    @Schema(description = "任务名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String taskName;

    @NotBlank(message = "任务类型不能为空")
    @Schema(description = "任务类型：播种/施肥/打药/采收/修剪", requiredMode = Schema.RequiredMode.REQUIRED)
    private String taskType;

    @Schema(description = "负责人")
    private String assignee;

    @Schema(description = "备注")
    private String remark;
}

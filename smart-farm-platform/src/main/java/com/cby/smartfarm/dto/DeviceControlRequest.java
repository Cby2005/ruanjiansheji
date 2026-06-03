package com.cby.smartfarm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "设备控制请求")
public class DeviceControlRequest {

    @NotBlank(message = "设备编号不能为空")
    @Schema(description = "设备编号", requiredMode = Schema.RequiredMode.REQUIRED)
    private String deviceCode;

    @NotBlank(message = "操作指令不能为空")
    @Schema(description = "操作指令：START/STOP/ADJUST", requiredMode = Schema.RequiredMode.REQUIRED)
    private String action;

    @Schema(description = "操作人")
    private String operator;
}

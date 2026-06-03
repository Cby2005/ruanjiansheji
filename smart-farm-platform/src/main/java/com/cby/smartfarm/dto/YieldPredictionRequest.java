package com.cby.smartfarm.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

@Data
@Schema(description = "产量预测请求")
public class YieldPredictionRequest {

    @NotBlank(message = "作物名称不能为空")
    @Schema(description = "作物名称", requiredMode = Schema.RequiredMode.REQUIRED)
    private String cropName;

    @NotNull(message = "基础产量不能为空")
    @DecimalMin(value = "0", message = "基础产量不能为负数")
    @Schema(description = "基础产量(kg)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Double baseYield;

    @NotNull(message = "环境评分不能为空")
    @DecimalMin(value = "0", message = "环境评分范围0~1")
    @DecimalMax(value = "1", message = "环境评分范围0~1")
    @Schema(description = "环境适宜度(0~1)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Double envScore;

    @NotNull(message = "任务评分不能为空")
    @DecimalMin(value = "0", message = "任务评分范围0~1")
    @DecimalMax(value = "1", message = "任务评分范围0~1")
    @Schema(description = "农事完成率(0~1)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Double taskScore;

    @NotNull(message = "设备评分不能为空")
    @DecimalMin(value = "0", message = "设备评分范围0~1")
    @DecimalMax(value = "1", message = "设备评分范围0~1")
    @Schema(description = "设备稳定系数(0~1)", requiredMode = Schema.RequiredMode.REQUIRED)
    private Double deviceScore;
}

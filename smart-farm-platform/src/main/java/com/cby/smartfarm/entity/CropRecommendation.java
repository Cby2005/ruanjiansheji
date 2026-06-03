package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 作物推荐实体
 * 用于存储作物推荐数据集，支持作物推荐和环境适宜度评分
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "crop_recommendation")
@Schema(description = "作物推荐数据")
public class CropRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "记录ID")
    private Long id;

    @Schema(description = "氮含量(N)")
    private Double n;

    @Schema(description = "磷含量(P)")
    private Double p;

    @Schema(description = "钾含量(K)")
    private Double k;

    @Schema(description = "温度(°C)")
    private Double temperature;

    @Schema(description = "湿度(%)")
    private Double humidity;

    @Schema(description = "pH值")
    private Double ph;

    @Schema(description = "降雨量(mm)")
    private Double rainfall;

    @Column(length = 50)
    @Schema(description = "作物名称/标签")
    private String label;
}

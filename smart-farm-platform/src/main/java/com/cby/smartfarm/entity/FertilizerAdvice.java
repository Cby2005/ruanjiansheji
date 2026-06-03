package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 施肥建议实体
 * 用于存储施肥建议数据集，根据作物和土壤参数生成施肥建议
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fertilizer_advice")
@Schema(description = "施肥建议数据")
public class FertilizerAdvice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "记录ID")
    private Long id;

    @Column(length = 50)
    @Schema(description = "作物名称")
    private String crop;

    @Schema(description = "氮含量(N)")
    private Double n;

    @Schema(description = "磷含量(P)")
    private Double p;

    @Schema(description = "钾含量(K)")
    private Double k;

    @Schema(description = "pH值")
    private Double ph;

    @Schema(description = "土壤湿度(%)")
    private Double soilMoisture;

    @Column(length = 100)
    @Schema(description = "肥料名称")
    private String fertilizerName;

    @Column(length = 50)
    @Schema(description = "肥料用量")
    private String fertilizerAmount;

    @Column(length = 500)
    @Schema(description = "施肥建议")
    private String advice;
}

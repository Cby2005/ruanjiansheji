package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 害虫类型实体
 * 用于存储IP102数据集中的害虫类别信息
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pest_type")
@Schema(description = "害虫类型数据")
public class PestType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "记录ID")
    private Long id;

    @Column(length = 20, unique = true)
    @Schema(description = "害虫编码")
    private String pestCode;

    @Column(length = 50)
    @Schema(description = "害虫名称")
    private String pestName;

    @Column(length = 50)
    @Schema(description = "害虫类别")
    private String pestCategory;

    @Column(length = 200)
    @Schema(description = "危害作物")
    private String damageCrop;

    @Column(length = 100)
    @Schema(description = "危害部位")
    private String damagePart;

    @Column(length = 500)
    @Schema(description = "危害症状")
    private String damageSymptom;

    @Column(length = 500)
    @Schema(description = "防治方法")
    private String preventionMethod;
}

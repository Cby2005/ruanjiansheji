package com.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "farm_zone")
@Schema(description = "农场区域")
public class FarmZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "区域ID")
    private Long id;

    @Column(nullable = false, length = 100)
    @Schema(description = "区域名称")
    private String name;

    @Column(length = 50)
    @Schema(description = "区域类型（温室/露天/大棚）")
    private String type;

    @Column(length = 500)
    @Schema(description = "区域描述")
    private String description;

    @Column(name = "area_size")
    @Schema(description = "面积(平方米)")
    private Double areaSize;

    @Column(name = "is_active")
    @Schema(description = "是否启用")
    private Boolean isActive = true;

    @Column(name = "created_at")
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

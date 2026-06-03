package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "farm_task")
@Schema(description = "农事任务")
public class FarmTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "任务ID")
    private Long id;

    @Column(name = "task_name", nullable = false, length = 200)
    @Schema(description = "任务名称")
    private String taskName;

    @Column(name = "task_type", length = 50)
    @Schema(description = "任务类型：播种/施肥/打药/采收/修剪")
    private String taskType;

    @Column(length = 100)
    @Schema(description = "负责人")
    private String assignee;

    @Column(nullable = false, length = 20)
    @Schema(description = "状态：TODO/DOING/DONE")
    private String status = "TODO";

    @Column(length = 500)
    @Schema(description = "备注")
    private String remark;

    @Column(name = "create_time")
    @Schema(description = "创建时间")
    private LocalDateTime createTime;

    @Column(name = "finish_time")
    @Schema(description = "完成时间")
    private LocalDateTime finishTime;

    @PrePersist
    public void prePersist() {
        if (this.createTime == null) {
            this.createTime = LocalDateTime.now();
        }
    }
}

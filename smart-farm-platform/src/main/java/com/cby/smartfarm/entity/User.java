package com.cby.smartfarm.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
@Schema(description = "用户信息")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "用户ID")
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    @Schema(description = "用户名")
    private String username;

    @Column(nullable = false)
    @Schema(description = "密码")
    private String password;

    @Column(nullable = false, length = 20)
    @Schema(description = "角色：ADMIN/TECHNICIAN/OPERATOR/VIEWER")
    private String role = "VIEWER";

    @Column(nullable = false)
    @Schema(description = "账号是否启用")
    private Boolean enabled = true;

    @Column(name = "created_at")
    @Schema(description = "创建时间")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = java.time.LocalDateTime.now();
        }
    }
}

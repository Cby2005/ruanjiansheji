package com.agriculture.domain;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sys_user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(length = 50)
    private String nickname;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 500)
    private String avatar;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private RoleType role;

    @Column(nullable = false)
    private Integer status = 1; // 1-正常 0-禁用

    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    public enum RoleType {
        ADMIN, TECHNICIAN, OPERATOR, VIEWER
    }

    @PrePersist
    public void prePersist() {
        this.createTime = LocalDateTime.now();
        this.updateTime = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.updateTime = LocalDateTime.now();
    }
}

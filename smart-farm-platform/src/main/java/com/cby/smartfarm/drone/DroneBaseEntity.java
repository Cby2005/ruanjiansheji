package com.cby.smartfarm.drone;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass
public abstract class DroneBaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;

    @PrePersist
    void create() {
        createTime = updateTime = LocalDateTime.now();
    }

    @PreUpdate
    void update() {
        updateTime = LocalDateTime.now();
    }
}

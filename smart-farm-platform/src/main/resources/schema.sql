-- ===========================================
-- 智慧农场综合管理平台 - 数据库初始化脚本
-- ===========================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS smart_farm 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE smart_farm;

-- ===========================================
-- 用户表
-- ===========================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL COMMENT '用户名',
    `password` VARCHAR(255) NOT NULL COMMENT '密码（BCrypt加密）',
    `role` VARCHAR(20) NOT NULL DEFAULT 'VIEWER' COMMENT '角色：ADMIN/TECHNICIAN/OPERATOR/VIEWER',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ===========================================
-- 设备表
-- ===========================================
DROP TABLE IF EXISTS `device`;
CREATE TABLE `device` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '设备ID',
    `device_code` VARCHAR(50) NOT NULL COMMENT '设备编号',
    `device_name` VARCHAR(100) NOT NULL COMMENT '设备名称',
    `device_type` VARCHAR(50) NOT NULL COMMENT '设备类型',
    `state` VARCHAR(20) NOT NULL DEFAULT 'STANDBY' COMMENT '设备状态：STANDBY/RUNNING/FAULT/MAINTENANCE/CALIBRATION',
    `area` VARCHAR(100) DEFAULT NULL COMMENT '安装区域',
    `online` TINYINT(1) DEFAULT 1 COMMENT '在线状态：0-离线 1-在线',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_device_code` (`device_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备表';

-- ===========================================
-- 环境记录表
-- ===========================================
DROP TABLE IF EXISTS `environment_record`;
CREATE TABLE `environment_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录ID',
    `record_time` DATETIME NOT NULL COMMENT '记录时间',
    `air_temperature` DECIMAL(5,2) DEFAULT NULL COMMENT '空气温度(°C)',
    `air_humidity` DECIMAL(5,2) DEFAULT NULL COMMENT '空气湿度(%)',
    `soil_temperature` DECIMAL(5,2) DEFAULT NULL COMMENT '土壤温度(°C)',
    `soil_humidity` DECIMAL(5,2) DEFAULT NULL COMMENT '土壤湿度(%)',
    `light_intensity` DECIMAL(10,2) DEFAULT NULL COMMENT '光照强度(lux)',
    `co2_level` DECIMAL(10,2) DEFAULT NULL COMMENT 'CO2浓度(ppm)',
    `ph_value` DECIMAL(4,2) DEFAULT NULL COMMENT 'pH值',
    `ec_value` DECIMAL(6,2) DEFAULT NULL COMMENT 'EC值(mS/cm)',
    `wind_speed` DECIMAL(5,2) DEFAULT NULL COMMENT '风速(m/s)',
    `rainfall` DECIMAL(5,2) DEFAULT NULL COMMENT '降雨量(mm)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_record_time` (`record_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='环境记录表';

-- ===========================================
-- 设备操作日志表
-- ===========================================
DROP TABLE IF EXISTS `device_operation_log`;
CREATE TABLE `device_operation_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志ID',
    `device_code` VARCHAR(50) NOT NULL COMMENT '设备编号',
    `device_name` VARCHAR(100) DEFAULT NULL COMMENT '设备名称',
    `operation` VARCHAR(50) NOT NULL COMMENT '操作类型',
    `operator` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
    `result` VARCHAR(20) DEFAULT NULL COMMENT '操作结果：SUCCESS/FAIL',
    `remark` VARCHAR(500) DEFAULT NULL COMMENT '备注',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_device_code` (`device_code`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='设备操作日志表';

-- ===========================================
-- 预警记录表
-- ===========================================
DROP TABLE IF EXISTS `alert_record`;
CREATE TABLE `alert_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '预警ID',
    `alert_type` VARCHAR(50) NOT NULL COMMENT '预警类型',
    `alert_level` VARCHAR(20) NOT NULL COMMENT '预警级别：LOW/MEDIUM/HIGH/CRITICAL',
    `title` VARCHAR(200) NOT NULL COMMENT '预警标题',
    `content` TEXT DEFAULT NULL COMMENT '预警内容',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE/RESOLVED/IGNORED',
    `resolved_at` DATETIME DEFAULT NULL COMMENT '解决时间',
    `resolved_by` VARCHAR(50) DEFAULT NULL COMMENT '解决人',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_alert_type` (`alert_type`),
    KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预警记录表';

-- ===========================================
-- 农事任务表
-- ===========================================
DROP TABLE IF EXISTS `farm_task`;
CREATE TABLE `farm_task` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务ID',
    `task_name` VARCHAR(200) NOT NULL COMMENT '任务名称',
    `task_type` VARCHAR(50) NOT NULL COMMENT '任务类型',
    `description` TEXT DEFAULT NULL COMMENT '任务描述',
    `status` VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态：PENDING/IN_PROGRESS/COMPLETED/CANCELLED',
    `priority` VARCHAR(20) DEFAULT 'MEDIUM' COMMENT '优先级：LOW/MEDIUM/HIGH',
    `assignee` VARCHAR(50) DEFAULT NULL COMMENT '负责人',
    `due_date` DATETIME DEFAULT NULL COMMENT '截止日期',
    `completed_at` DATETIME DEFAULT NULL COMMENT '完成时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_status` (`status`),
    KEY `idx_assignee` (`assignee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='农事任务表';

-- ===========================================
-- 产量预测表
-- ===========================================
DROP TABLE IF EXISTS `yield_prediction`;
CREATE TABLE `yield_prediction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '预测ID',
    `crop_type` VARCHAR(50) NOT NULL COMMENT '作物类型',
    `prediction_date` DATE NOT NULL COMMENT '预测日期',
    `predicted_yield` DECIMAL(10,2) DEFAULT NULL COMMENT '预测产量(kg)',
    `actual_yield` DECIMAL(10,2) DEFAULT NULL COMMENT '实际产量(kg)',
    `confidence` DECIMAL(5,2) DEFAULT NULL COMMENT '置信度(%)',
    `factors` TEXT DEFAULT NULL COMMENT '影响因素',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `idx_crop_type` (`crop_type`),
    KEY `idx_prediction_date` (`prediction_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产量预测表';

-- ===========================================
-- 作物推荐数据表
-- ===========================================
DROP TABLE IF EXISTS `crop_recommendation`;
CREATE TABLE `crop_recommendation` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `n` DECIMAL(10,2) DEFAULT NULL COMMENT '氮含量',
    `p` DECIMAL(10,2) DEFAULT NULL COMMENT '磷含量',
    `k` DECIMAL(10,2) DEFAULT NULL COMMENT '钾含量',
    `temperature` DECIMAL(5,2) DEFAULT NULL COMMENT '温度',
    `humidity` DECIMAL(5,2) DEFAULT NULL COMMENT '湿度',
    `ph` DECIMAL(4,2) DEFAULT NULL COMMENT 'pH值',
    `rainfall` DECIMAL(10,2) DEFAULT NULL COMMENT '降雨量',
    `label` VARCHAR(50) DEFAULT NULL COMMENT '推荐作物',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作物推荐数据表';

-- ===========================================
-- 施肥建议表
-- ===========================================
DROP TABLE IF EXISTS `fertilizer_advice`;
CREATE TABLE `fertilizer_advice` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `crop_type` VARCHAR(50) DEFAULT NULL COMMENT '作物类型',
    `soil_type` VARCHAR(50) DEFAULT NULL COMMENT '土壤类型',
    `nitrogen` DECIMAL(10,2) DEFAULT NULL COMMENT '氮需求量',
    `phosphorus` DECIMAL(10,2) DEFAULT NULL COMMENT '磷需求量',
    `potassium` DECIMAL(10,2) DEFAULT NULL COMMENT '钾需求量',
    `fertilizer_type` VARCHAR(100) DEFAULT NULL COMMENT '推荐肥料类型',
    `dosage` DECIMAL(10,2) DEFAULT NULL COMMENT '用量(kg/亩)',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='施肥建议表';

-- ===========================================
-- 害虫类型表
-- ===========================================
DROP TABLE IF EXISTS `pest_type`;
CREATE TABLE `pest_type` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `pest_name` VARCHAR(100) NOT NULL COMMENT '害虫名称',
    `pest_category` VARCHAR(50) DEFAULT NULL COMMENT '害虫分类',
    `description` TEXT DEFAULT NULL COMMENT '描述',
    `harmful_part` VARCHAR(100) DEFAULT NULL COMMENT '危害部位',
    `occurrence_season` VARCHAR(100) DEFAULT NULL COMMENT '发生季节',
    `prevention_method` TEXT DEFAULT NULL COMMENT '防治方法',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='害虫类型表';

-- ===========================================
-- 插入默认管理员用户（密码：admin123，BCrypt加密）
-- ===========================================
INSERT INTO `user` (`username`, `password`, `role`) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'ADMIN'),
('tech', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'TECHNICIAN'),
('operator', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'OPERATOR'),
('viewer', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EH', 'VIEWER');

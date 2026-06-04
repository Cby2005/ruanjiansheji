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

CREATE TABLE IF NOT EXISTS weather_record (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    farm_id BIGINT,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    record_time DATETIME,
    temperature DOUBLE,
    humidity DOUBLE,
    precipitation DOUBLE,
    wind_speed DOUBLE,
    soil_temperature DOUBLE,
    soil_moisture DOUBLE,
    source VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- 城市经纬度表
-- ===========================================
DROP TABLE IF EXISTS `city_location`;
CREATE TABLE `city_location` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `province` VARCHAR(50) NOT NULL COMMENT '省份',
    `city_name` VARCHAR(50) NOT NULL COMMENT '城市名称',
    `latitude` DOUBLE NOT NULL COMMENT '纬度',
    `longitude` DOUBLE NOT NULL COMMENT '经度',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_city_name` (`city_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='城市经纬度表';

-- 插入主要城市经纬度数据
INSERT INTO `city_location` (`province`, `city_name`, `latitude`, `longitude`) VALUES
('北京市', '北京市', 39.9042, 116.4074),
('天津市', '天津市', 39.0842, 117.2010),
('上海市', '上海市', 31.2304, 121.4737),
('重庆市', '重庆市', 29.5630, 106.5516),
('河北省', '石家庄市', 38.0428, 114.5149),
('河北省', '唐山市', 39.6292, 118.1802),
('河北省', '秦皇岛市', 39.9354, 119.5978),
('河北省', '邯郸市', 36.6258, 114.5391),
('河北省', '邢台市', 37.0682, 114.5048),
('河北省', '保定市', 38.8740, 115.4646),
('河北省', '张家口市', 40.7670, 114.8868),
('河北省', '承德市', 40.9510, 117.9633),
('河北省', '沧州市', 38.3047, 116.8387),
('河北省', '廊坊市', 39.5168, 116.6838),
('河北省', '衡水市', 37.7350, 115.6702),
('山西省', '太原市', 37.8706, 112.5489),
('山西省', '大同市', 40.0763, 113.3001),
('山西省', '阳泉市', 37.8569, 113.5809),
('山西省', '长治市', 36.1954, 113.1163),
('山西省', '晋城市', 35.4908, 112.8513),
('山西省', '朔州市', 39.3316, 112.4329),
('山西省', '晋中市', 37.6872, 112.7527),
('山西省', '运城市', 35.0261, 111.0070),
('山西省', '忻州市', 38.4177, 112.7340),
('山西省', '临汾市', 36.0882, 111.5190),
('山西省', '吕梁市', 37.5193, 111.1420),
('内蒙古', '呼和浩特市', 40.8424, 111.7500),
('内蒙古', '包头市', 40.6571, 109.8401),
('内蒙古', '乌海市', 39.6553, 106.7943),
('内蒙古', '赤峰市', 42.2588, 118.9563),
('内蒙古', '通辽市', 43.6174, 122.2630),
('内蒙古', '鄂尔多斯市', 39.6086, 109.7812),
('内蒙古', '呼伦贝尔市', 49.2117, 119.7665),
('内蒙古', '巴彦淖尔市', 40.7432, 107.3877),
('内蒙古', '乌兰察布市', 41.0223, 113.1143),
('辽宁省', '沈阳市', 41.8057, 123.4315),
('辽宁省', '大连市', 38.9140, 121.6147),
('辽宁省', '鞍山市', 41.1100, 122.9946),
('辽宁省', '抚顺市', 41.8757, 123.9572),
('辽宁省', '本溪市', 41.2971, 123.7665),
('辽宁省', '丹东市', 40.0005, 124.3545),
('辽宁省', '锦州市', 41.0951, 121.1270),
('辽宁省', '营口市', 40.6674, 122.2352),
('辽宁省', '阜新市', 42.0118, 121.6482),
('辽宁省', '辽阳市', 41.2695, 123.1730),
('辽宁省', '盘锦市', 41.1199, 122.0707),
('辽宁省', '铁岭市', 42.2862, 123.8420),
('辽宁省', '朝阳市', 41.5736, 120.4507),
('辽宁省', '葫芦岛市', 40.7110, 120.8369),
('吉林省', '长春市', 43.8171, 125.3235),
('吉林省', '吉林市', 43.8378, 126.5496),
('吉林省', '四平市', 43.1612, 124.3504),
('吉林省', '辽源市', 42.8880, 125.1437),
('吉林省', '通化市', 41.7212, 125.9365),
('吉林省', '白山市', 41.9441, 126.4273),
('吉林省', '松原市', 45.1180, 124.8252),
('吉林省', '白城市', 45.6197, 122.8377),
('黑龙江省', '哈尔滨市', 45.8038, 126.5350),
('黑龙江省', '齐齐哈尔市', 47.3543, 123.9182),
('黑龙江省', '鸡西市', 45.2951, 130.9693),
('黑龙江省', '鹤岗市', 47.3499, 130.2979),
('黑龙江省', '双鸭山市', 46.6469, 131.1416),
('黑龙江省', '大庆市', 46.5893, 125.1038),
('黑龙江省', '伊春市', 47.7268, 128.8409),
('黑龙江省', '佳木斯市', 46.7999, 130.3187),
('黑龙江省', '七台河市', 45.7713, 131.0032),
('黑龙江省', '牡丹江市', 44.5530, 129.6330),
('黑龙江省', '黑河市', 50.2451, 127.5285),
('黑龙江省', '绥化市', 46.6366, 126.9810),
('江苏省', '南京市', 32.0603, 118.7969),
('江苏省', '无锡市', 31.4912, 120.3119),
('江苏省', '徐州市', 34.2610, 117.1846),
('江苏省', '常州市', 31.8112, 119.9741),
('江苏省', '苏州市', 31.2990, 120.5853),
('江苏省', '南通市', 32.0147, 120.8647),
('江苏省', '连云港市', 34.5967, 119.2216),
('江苏省', '淮安市', 33.6025, 119.0153),
('江苏省', '盐城市', 33.3477, 120.1614),
('江苏省', '扬州市', 32.3942, 119.4129),
('江苏省', '镇江市', 32.1878, 119.4258),
('江苏省', '泰州市', 32.4555, 119.9231),
('江苏省', '宿迁市', 33.9630, 118.2752),
('浙江省', '杭州市', 30.2741, 120.1551),
('浙江省', '宁波市', 29.8683, 121.5440),
('浙江省', '温州市', 28.0006, 120.6721),
('浙江省', '嘉兴市', 30.7539, 120.7585),
('浙江省', '湖州市', 30.8926, 120.0155),
('浙江省', '绍兴市', 30.0293, 120.5807),
('浙江省', '金华市', 29.0788, 119.6496),
('浙江省', '衢州市', 28.9417, 118.8744),
('浙江省', '舟山市', 30.0160, 122.1068),
('浙江省', '台州市', 28.6569, 121.4208),
('浙江省', '丽水市', 28.4672, 119.9118),
('安徽省', '合肥市', 31.8206, 117.2272),
('安徽省', '芜湖市', 31.3529, 118.3763),
('安徽省', '蚌埠市', 32.9167, 117.3886),
('安徽省', '淮南市', 32.6416, 116.9998),
('安徽省', '马鞍山市', 31.6707, 118.5079),
('安徽省', '淮北市', 33.9558, 116.7983),
('安徽省', '铜陵市', 30.9455, 117.8115),
('安徽省', '安庆市', 30.5430, 117.0633),
('安徽省', '黄山市', 29.7147, 118.3375),
('安徽省', '滁州市', 32.3006, 118.3172),
('安徽省', '阜阳市', 32.8899, 115.8125),
('安徽省', '宿州市', 33.6339, 116.9848),
('安徽省', '六安市', 31.7350, 116.5080),
('安徽省', '亳州市', 33.8446, 115.7785),
('安徽省', '池州市', 30.6648, 117.4915),
('安徽省', '宣城市', 30.9407, 118.7587),
('福建省', '福州市', 26.0745, 119.2965),
('福建省', '厦门市', 24.4798, 118.0894),
('福建省', '莆田市', 25.4541, 119.0077),
('福建省', '三明市', 26.2634, 117.6350),
('福建省', '泉州市', 24.8740, 118.6757),
('福建省', '漳州市', 24.5130, 117.6471),
('福建省', '南平市', 26.6356, 118.1778),
('福建省', '龙岩市', 25.0751, 117.0174),
('福建省', '宁德市', 26.6563, 119.5478),
('江西省', '南昌市', 28.6820, 115.8579),
('江西省', '景德镇市', 29.2688, 117.1786),
('江西省', '萍乡市', 27.6228, 113.8545),
('江西省', '九江市', 29.7054, 116.0019),
('江西省', '新余市', 27.8178, 114.9173),
('江西省', '鹰潭市', 28.2603, 117.0692),
('江西省', '赣州市', 25.8312, 114.9334),
('江西省', '吉安市', 27.0883, 114.9937),
('江西省', '宜春市', 27.8001, 114.3913),
('江西省', '抚州市', 27.9478, 116.3581),
('江西省', '上饶市', 28.4549, 117.9434),
('山东省', '济南市', 36.6512, 116.9972),
('山东省', '青岛市', 36.0671, 120.3826),
('山东省', '淄博市', 36.8131, 118.0548),
('山东省', '枣庄市', 34.8562, 117.3301),
('山东省', '东营市', 37.4346, 118.6747),
('山东省', '烟台市', 37.4638, 121.4479),
('山东省', '潍坊市', 36.7068, 119.1618),
('山东省', '济宁市', 35.4151, 116.5871),
('山东省', '泰安市', 36.1950, 117.0873),
('山东省', '威海市', 37.5131, 122.1206),
('山东省', '日照市', 35.3827, 119.5269),
('山东省', '临沂市', 35.1046, 118.3563),
('山东省', '德州市', 37.4341, 116.3575),
('山东省', '聊城市', 36.4560, 115.9854),
('山东省', '滨州市', 37.3817, 117.9727),
('山东省', '菏泽市', 35.2334, 115.4807),
('河南省', '郑州市', 34.7466, 113.6254),
('河南省', '开封市', 34.7972, 114.3077),
('河南省', '洛阳市', 34.6197, 112.4540),
('河南省', '平顶山市', 33.7662, 113.1926),
('河南省', '安阳市', 36.0968, 114.3928),
('河南省', '鹤壁市', 35.7472, 114.2974),
('河南省', '新乡市', 35.3036, 113.9268),
('河南省', '焦作市', 35.2159, 113.2418),
('河南省', '濮阳市', 35.7627, 115.0294),
('河南省', '许昌市', 34.0220, 113.8520),
('河南省', '漯河市', 33.5815, 114.0166),
('河南省', '三门峡市', 34.7725, 111.1943),
('河南省', '南阳市', 32.9990, 112.5283),
('河南省', '商丘市', 34.4371, 115.6505),
('河南省', '信阳市', 32.1471, 114.0928),
('河南省', '周口市', 33.6259, 114.6969),
('河南省', '驻马店市', 33.0115, 114.0223),
('湖北省', '武汉市', 30.5928, 114.3055),
('湖北省', '黄石市', 30.1997, 115.0385),
('湖北省', '十堰市', 32.6292, 110.8011),
('湖北省', '宜昌市', 30.6919, 111.2865),
('湖北省', '襄阳市', 32.0090, 112.1225),
('湖北省', '鄂州市', 30.3919, 114.8948),
('湖北省', '荆门市', 31.0354, 112.1993),
('湖北省', '孝感市', 30.9246, 113.9169),
('湖北省', '荆州市', 30.3261, 112.2391),
('湖北省', '黄冈市', 30.4539, 114.8724),
('湖北省', '咸宁市', 29.8328, 114.3289),
('湖北省', '随州市', 31.6902, 113.3825),
('湖南省', '长沙市', 28.2282, 112.9388),
('湖南省', '株洲市', 27.8277, 113.1339),
('湖南省', '湘潭市', 27.8298, 112.9441),
('湖南省', '衡阳市', 26.8934, 112.5720),
('湖南省', '邵阳市', 27.2389, 111.4692),
('湖南省', '岳阳市', 29.3572, 113.1289),
('湖南省', '常德市', 29.0317, 111.6985),
('湖南省', '张家界市', 29.1170, 110.4793),
('湖南省', '益阳市', 28.5539, 112.3552),
('湖南省', '郴州市', 25.7700, 113.0148),
('湖南省', '永州市', 26.4204, 111.6125),
('湖南省', '怀化市', 27.5501, 109.9712),
('湖南省', '娄底市', 27.6973, 111.9945),
('广东省', '广州市', 23.1291, 113.2644),
('广东省', '韶关市', 24.8103, 113.5976),
('广东省', '深圳市', 22.5431, 114.0579),
('广东省', '珠海市', 22.2710, 113.5767),
('广东省', '汕头市', 23.3541, 116.6820),
('广东省', '佛山市', 23.0218, 113.1219),
('广东省', '江门市', 22.5788, 113.0815),
('广东省', '湛江市', 21.2707, 110.3594),
('广东省', '茂名市', 21.6682, 110.9254),
('广东省', '肇庆市', 23.0471, 112.4651),
('广东省', '惠州市', 23.1117, 114.4162),
('广东省', '梅州市', 24.2886, 116.1176),
('广东省', '汕尾市', 22.7861, 115.3753),
('广东省', '河源市', 23.7437, 114.7005),
('广东省', '阳江市', 21.8577, 111.9825),
('广东省', '清远市', 23.6820, 113.0561),
('广东省', '东莞市', 23.0207, 113.7518),
('广东省', '中山市', 22.5170, 113.3926),
('广东省', '潮州市', 23.6618, 116.6227),
('广东省', '揭阳市', 23.5500, 116.3728),
('广东省', '云浮市', 22.9151, 112.0445),
('广西', '南宁市', 22.8170, 108.3665),
('广西', '柳州市', 24.3255, 109.4158),
('广西', '桂林市', 25.2736, 110.2900),
('广西', '梧州市', 23.4769, 111.2784),
('广西', '北海市', 21.4812, 109.1201),
('广西', '防城港市', 21.6146, 108.3464),
('广西', '钦州市', 21.9797, 108.6543),
('广西', '贵港市', 23.1115, 109.5989),
('广西', '玉林市', 22.6331, 110.1544),
('广西', '百色市', 23.9023, 106.6187),
('广西', '贺州市', 24.4036, 111.5667),
('广西', '河池市', 24.6929, 108.0852),
('广西', '来宾市', 23.7338, 109.2214),
('广西', '崇左市', 22.3789, 107.3647),
('海南省', '海口市', 20.0174, 110.3492),
('海南省', '三亚市', 18.2528, 109.5120),
('海南省', '三沙市', 16.8327, 112.3380),
('海南省', '儋州市', 19.5210, 109.5808),
('四川省', '成都市', 30.5728, 104.0668),
('四川省', '自贡市', 29.3392, 104.7786),
('四川省', '攀枝花市', 26.5805, 101.7185),
('四川省', '泸州市', 28.8717, 105.4423),
('四川省', '德阳市', 31.1270, 104.3980),
('四川省', '绵阳市', 31.4679, 104.7416),
('四川省', '广元市', 32.4354, 105.8434),
('四川省', '遂宁市', 30.5328, 105.5926),
('四川省', '内江市', 29.5802, 105.0584),
('四川省', '乐山市', 29.5522, 103.7659),
('四川省', '南充市', 30.8376, 106.1107),
('四川省', '眉山市', 30.0755, 103.8487),
('四川省', '宜宾市', 28.7513, 104.6417),
('四川省', '广安市', 30.4560, 106.6331),
('四川省', '达州市', 31.2087, 107.4680),
('四川省', '雅安市', 30.0104, 103.0422),
('四川省', '巴中市', 31.8679, 106.7475),
('四川省', '资阳市', 30.1289, 104.6276),
('贵州省', '贵阳市', 26.6470, 106.6302),
('贵州省', '六盘水市', 26.5927, 104.8304),
('贵州省', '遵义市', 27.7254, 106.9273),
('贵州省', '安顺市', 26.2531, 105.9477),
('贵州省', '毕节市', 27.3022, 105.2850),
('贵州省', '铜仁市', 27.7183, 109.1808),
('云南省', '昆明市', 25.0389, 102.7183),
('云南省', '曲靖市', 25.4900, 103.7962),
('云南省', '玉溪市', 24.3520, 102.5467),
('云南省', '保山市', 25.1121, 99.1615),
('云南省', '昭通市', 27.3382, 103.7173),
('云南省', '丽江市', 26.8553, 100.2271),
('云南省', '普洱市', 22.8251, 100.9662),
('云南省', '临沧市', 23.8776, 100.0796),
('西藏', '拉萨市', 29.6500, 91.1000),
('西藏', '日喀则市', 29.2674, 88.8808),
('西藏', '昌都市', 31.1369, 97.1785),
('西藏', '林芝市', 29.6491, 94.3624),
('西藏', '山南市', 29.2371, 91.7666),
('西藏', '那曲市', 31.4761, 92.0515),
('陕西省', '西安市', 34.3416, 108.9398),
('陕西省', '铜川市', 34.8967, 108.9451),
('陕西省', '宝鸡市', 34.3619, 107.2371),
('陕西省', '咸阳市', 34.3296, 108.7091),
('陕西省', '渭南市', 34.4996, 109.5021),
('陕西省', '延安市', 36.5853, 109.4896),
('陕西省', '汉中市', 33.0674, 107.0230),
('陕西省', '榆林市', 38.2853, 109.7346),
('陕西省', '安康市', 32.6849, 109.0295),
('陕西省', '商洛市', 33.8704, 109.9406),
('甘肃省', '兰州市', 36.0611, 103.8343),
('甘肃省', '嘉峪关市', 39.7720, 98.2901),
('甘肃省', '金昌市', 38.5201, 102.1879),
('甘肃省', '白银市', 36.5451, 104.1388),
('甘肃省', '天水市', 34.5809, 105.7249),
('甘肃省', '武威市', 37.9283, 102.6347),
('甘肃省', '张掖市', 38.9259, 100.4498),
('甘肃省', '平凉市', 35.5427, 106.6651),
('甘肃省', '酒泉市', 39.7329, 98.4941),
('甘肃省', '庆阳市', 35.7342, 107.6384),
('甘肃省', '定西市', 35.5822, 104.5923),
('甘肃省', '陇南市', 33.3882, 104.9216),
('青海省', '西宁市', 36.6171, 101.7782),
('青海省', '海东市', 36.5023, 102.1041),
('宁夏', '银川市', 38.4872, 106.2309),
('宁夏', '石嘴山市', 38.9843, 106.3830),
('宁夏', '吴忠市', 37.9862, 106.1995),
('宁夏', '固原市', 36.0168, 106.2390),
('宁夏', '中卫市', 37.5149, 105.1893),
('新疆', '乌鲁木齐市', 43.8256, 87.6168),
('新疆', '克拉玛依市', 45.5959, 84.8733),
('新疆', '吐鲁番市', 42.9513, 89.1895),
('新疆', '哈密市', 42.8186, 93.5152);


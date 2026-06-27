CREATE TABLE IF NOT EXISTS drone_device (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, drone_code VARCHAR(50) NOT NULL, drone_name VARCHAR(100) NOT NULL,
  model VARCHAR(100), battery_level INT DEFAULT 100, status VARCHAR(20) DEFAULT 'IDLE', camera_status VARCHAR(20) DEFAULT 'NORMAL',
  current_x DOUBLE DEFAULT 0, current_y DOUBLE DEFAULT 0, current_z DOUBLE DEFAULT 0, greenhouse_id BIGINT, remark VARCHAR(255),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_drone_code (drone_code), KEY idx_drone_status (status), KEY idx_drone_greenhouse (greenhouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无人机设备';

CREATE TABLE IF NOT EXISTS drone_inspection_point (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键', point_name VARCHAR(100) NOT NULL COMMENT '巡检点名称',
  greenhouse_id BIGINT NOT NULL COMMENT '所属温室ID', area_name VARCHAR(100) COMMENT '所属区域',
  x DOUBLE NOT NULL DEFAULT 0 COMMENT '温室局部X坐标', y DOUBLE NOT NULL DEFAULT 0 COMMENT '温室局部Y坐标',
  z DOUBLE NOT NULL DEFAULT 1.5 COMMENT '温室局部Z坐标', longitude DECIMAL(12,6) NOT NULL COMMENT '经度',
  latitude DECIMAL(12,6) NOT NULL COMMENT '纬度', altitude DECIMAL(8,2) DEFAULT 1.50 COMMENT '飞行高度',
  point_type VARCHAR(30) NOT NULL DEFAULT 'NORMAL' COMMENT 'START/NORMAL/ABNORMAL/END', remark VARCHAR(255) COMMENT '备注',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  KEY idx_point_name (point_name), KEY idx_point_greenhouse (greenhouse_id), KEY idx_point_type (point_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='温室巡检点';

CREATE TABLE IF NOT EXISTS drone_route_plan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键', route_code VARCHAR(50) NOT NULL COMMENT '路径编号',
  route_name VARCHAR(100) NOT NULL COMMENT '路径名称', greenhouse_id BIGINT NOT NULL COMMENT '温室ID',
  route_type VARCHAR(30) NOT NULL COMMENT '路径类型', algorithm_type VARCHAR(30) NOT NULL COMMENT 'ORDER/NEAREST',
  start_point VARCHAR(255) COMMENT '起点坐标JSON', end_point VARCHAR(255) COMMENT '终点坐标JSON',
  waypoints LONGTEXT COMMENT '航点JSON', flight_height DOUBLE COMMENT '飞行高度',
  estimated_time INT COMMENT '预计耗时秒', total_distance DECIMAL(10,2) COMMENT '总距离米', status VARCHAR(30) DEFAULT 'READY' COMMENT '状态',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY uk_route_code (route_code), KEY idx_route_greenhouse (greenhouse_id), KEY idx_route_type (route_type), KEY idx_route_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无人机巡检路径';

CREATE TABLE IF NOT EXISTS drone_inspection_task (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, task_code VARCHAR(50) NOT NULL, task_name VARCHAR(100) NOT NULL, drone_id BIGINT,
  route_id BIGINT, greenhouse_id BIGINT, task_type VARCHAR(30), task_status VARCHAR(20) DEFAULT 'PENDING', start_time DATETIME,
  end_time DATETIME, result TEXT, remark VARCHAR(255), create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_drone_task_code (task_code), KEY idx_drone_task_status (task_status), KEY idx_drone_task_drone (drone_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无人机巡检任务';

CREATE TABLE IF NOT EXISTS drone_inspection_image (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, task_id BIGINT NOT NULL, image_url VARCHAR(500) NOT NULL, capture_point VARCHAR(255),
  detect_result VARCHAR(20) DEFAULT 'PENDING', disease_type VARCHAR(100), confidence DOUBLE, suggestion TEXT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_drone_image_task (task_id), KEY idx_drone_image_result (detect_result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无人机巡检图像';

CREATE TABLE IF NOT EXISTS drone_inspection_report (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, task_id BIGINT NOT NULL, task_name VARCHAR(100), drone_name VARCHAR(100), route_name VARCHAR(100),
  inspection_area VARCHAR(100), start_time DATETIME, end_time DATETIME, total_images INT DEFAULT 0, abnormal_images INT DEFAULT 0,
  disease_types TEXT, suggestion TEXT, report_time DATETIME, create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_drone_report_task (task_id), KEY idx_drone_report_time (report_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无人机巡检报告';

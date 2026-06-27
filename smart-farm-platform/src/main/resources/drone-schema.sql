CREATE TABLE IF NOT EXISTS drone_device (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, drone_code VARCHAR(50) NOT NULL, drone_name VARCHAR(100) NOT NULL,
  model VARCHAR(100), battery_level INT DEFAULT 100, status VARCHAR(20) DEFAULT 'IDLE', camera_status VARCHAR(20) DEFAULT 'NORMAL',
  current_x DOUBLE DEFAULT 0, current_y DOUBLE DEFAULT 0, current_z DOUBLE DEFAULT 0, greenhouse_id BIGINT, remark VARCHAR(255),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_drone_code (drone_code), KEY idx_drone_status (status), KEY idx_drone_greenhouse (greenhouse_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='无人机设备';

CREATE TABLE IF NOT EXISTS drone_inspection_point (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, point_name VARCHAR(100) NOT NULL, greenhouse_id BIGINT, area_name VARCHAR(100),
  x DOUBLE NOT NULL, y DOUBLE NOT NULL, z DOUBLE NOT NULL, point_type VARCHAR(30) DEFAULT 'NORMAL', remark VARCHAR(255),
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_point_greenhouse (greenhouse_id), KEY idx_point_area_type (area_name, point_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='温室巡检点';

CREATE TABLE IF NOT EXISTS drone_route_plan (
  id BIGINT PRIMARY KEY AUTO_INCREMENT, route_code VARCHAR(50) NOT NULL, route_name VARCHAR(100) NOT NULL, greenhouse_id BIGINT,
  route_type VARCHAR(30), start_point VARCHAR(255), end_point VARCHAR(255), waypoints LONGTEXT, flight_height DOUBLE,
  estimated_time DOUBLE, total_distance DOUBLE, status VARCHAR(20) DEFAULT 'READY',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP, update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_route_code (route_code), KEY idx_route_greenhouse_type (greenhouse_id, route_type)
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

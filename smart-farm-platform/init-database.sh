#!/bin/bash

echo "==========================================="
echo "智慧农场综合管理平台 - 数据库初始化脚本"
echo "==========================================="
echo ""

echo "请确保 MySQL 服务已启动"
echo "数据库连接信息："
echo "  - 主机: localhost"
echo "  - 端口: 3306"
echo "  - 用户名: root"
echo "  - 密码: 20050828"
echo ""

read -p "是否继续初始化数据库？(y/n): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    echo "已取消操作"
    exit 0
fi

echo ""
echo "正在初始化数据库..."
echo ""

mysql -h localhost -u root -p20050828 < src/main/resources/schema.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "==========================================="
    echo "数据库初始化成功！"
    echo "==========================================="
    echo ""
    echo "默认用户账户："
    echo "  - 管理员: admin / admin123"
    echo "  - 技术员: tech / tech123"
    echo "  - 操作员: operator / operator123"
    echo "  - 观察者: viewer / viewer123"
    echo ""
else
    echo ""
    echo "数据库初始化失败，请检查 MySQL 连接信息"
    echo ""
fi

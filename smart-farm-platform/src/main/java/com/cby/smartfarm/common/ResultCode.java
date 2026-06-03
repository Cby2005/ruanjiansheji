package com.cby.smartfarm.common;

import lombok.Getter;

@Getter
public enum ResultCode {

    SUCCESS(200, "操作成功"),
    FAIL(500, "操作失败"),
    VALIDATE_FAILED(400, "参数校验失败"),
    NO_PERMISSION(403, "没有相关权限"),
    NOT_FOUND(404, "资源不存在"),
    DEVICE_STATE_ERROR(1001, "设备状态错误"),
    SENSOR_TYPE_ERROR(1002, "传感器类型错误");

    private final int code;
    private final String message;

    ResultCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}

package com.cby.smartfarm.design.proxy;

/**
 * 远程设备服务接口 - 代理模式
 *
 * 代理模式用于在真实设备访问之前增加权限校验和操作审计。
 * 客户端通过此接口调用设备控制，不关心底层是代理还是真实对象。
 */
public interface RemoteDeviceService {

    String controlDevice(String username, String deviceCode, String action);
}

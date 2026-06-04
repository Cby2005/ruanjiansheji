package com.cby.smartfarm.design.adapter;

public interface SmartActuatorPort {

    String getDeviceType();

    String execute(String area, String action, double value);
}

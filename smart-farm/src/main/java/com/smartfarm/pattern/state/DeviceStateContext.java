package com.smartfarm.pattern.state;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.pattern.state.impl.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Slf4j
@Component
public class DeviceStateContext {

    private static final Map<DeviceStateType, DeviceState> STATE_MAP = new EnumMap<>(DeviceStateType.class);

    static {
        STATE_MAP.put(DeviceStateType.IDLE, new IdleState());
        STATE_MAP.put(DeviceStateType.RUNNING, new RunningState());
        STATE_MAP.put(DeviceStateType.ERROR, new ErrorState());
        STATE_MAP.put(DeviceStateType.MAINTENANCE, new MaintenanceState());
        STATE_MAP.put(DeviceStateType.OFFLINE, new OfflineState());
        STATE_MAP.put(DeviceStateType.PAUSED, new PausedState());
    }

    public DeviceState getState(Device device) {
        return STATE_MAP.getOrDefault(device.getState(), new OfflineState());
    }

    public void start(Device device) {
        getState(device).start(device);
    }

    public void stop(Device device) {
        getState(device).stop(device);
    }

    public void pause(Device device) {
        getState(device).pause(device);
    }

    public void resume(Device device) {
        getState(device).resume(device);
    }

    public void handleError(Device device) {
        getState(device).handleError(device);
    }

    public void maintenance(Device device) {
        getState(device).maintenance(device);
    }
}

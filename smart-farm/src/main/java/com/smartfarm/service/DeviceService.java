package com.smartfarm.service;

import com.smartfarm.entity.Device;
import com.smartfarm.entity.enums.DeviceStateType;
import com.smartfarm.entity.enums.DeviceType;
import com.smartfarm.pattern.command.CommandInvoker;
import com.smartfarm.pattern.command.impl.StartDeviceCommand;
import com.smartfarm.pattern.command.impl.StopDeviceCommand;
import com.smartfarm.pattern.command.impl.AdjustParameterCommand;
import com.smartfarm.pattern.state.DeviceStateContext;
import com.smartfarm.pattern.proxy.DeviceAccessProxy;
import com.smartfarm.pattern.decorator.BaseDeviceFunction;
import com.smartfarm.pattern.decorator.DeviceFunction;
import com.smartfarm.pattern.decorator.impl.EnergyMonitorDecorator;
import com.smartfarm.pattern.decorator.impl.RuntimeStatsDecorator;
import com.smartfarm.repository.DeviceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private CommandInvoker commandInvoker;

    @Autowired
    private DeviceStateContext stateContext;

    @Autowired
    private DeviceAccessProxy deviceAccessProxy;

    public List<Device> findAll() {
        return deviceRepository.findAll();
    }

    public Device findById(Long id) {
        return deviceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("设备不存在: " + id));
    }

    public List<Device> findByZone(Long zoneId) {
        return deviceRepository.findByZoneId(zoneId);
    }

    public List<Device> findByType(DeviceType type) {
        return deviceRepository.findByDeviceType(type);
    }

    @Transactional
    public Device create(Device device) {
        device.setId(null);
        device.setState(DeviceStateType.IDLE);
        return deviceRepository.save(device);
    }

    @Transactional
    public Device update(Long id, Device device) {
        Device existing = findById(id);
        existing.setName(device.getName());
        existing.setDeviceType(device.getDeviceType());
        existing.setZoneId(device.getZoneId());
        existing.setPowerConsumption(device.getPowerConsumption());
        return deviceRepository.save(existing);
    }

    public String startDevice(Long deviceId, String userId) {
        deviceAccessProxy.sendCommand(deviceId, "START", userId);
        Device device = findById(deviceId);
        String result = commandInvoker.executeCommand(new StartDeviceCommand(device), deviceId);
        deviceRepository.save(device);
        return result;
    }

    public String stopDevice(Long deviceId, String userId) {
        deviceAccessProxy.sendCommand(deviceId, "STOP", userId);
        Device device = findById(deviceId);
        String result = commandInvoker.executeCommand(new StopDeviceCommand(device), deviceId);
        deviceRepository.save(device);
        return result;
    }

    public String adjustParameter(Long deviceId, Map<String, Object> params, String userId) {
        deviceAccessProxy.sendCommand(deviceId, "ADJUST", userId);
        Device device = findById(deviceId);
        return commandInvoker.executeCommand(
                new AdjustParameterCommand(device.getName(), params), deviceId);
    }

    public String undoLastCommand(Long deviceId) {
        return commandInvoker.undoLastCommand(deviceId);
    }

    public Map<String, Object> getDeviceDetail(Long deviceId) {
        Device device = findById(deviceId);
        DeviceFunction function = new BaseDeviceFunction(device.getName());
        EnergyMonitorDecorator energyDecorator = new EnergyMonitorDecorator(function);
        RuntimeStatsDecorator statsDecorator = new RuntimeStatsDecorator(energyDecorator);

        Map<String, Object> detail = new LinkedHashMap<>();
        detail.put("device", device);
        detail.put("功能描述", statsDecorator.getDescription());
        detail.put("附加功能费用", statsDecorator.getExtraCost());
        detail.put("当前功率W", energyDecorator.getCurrentPowerConsumption());
        detail.put("日用电量kWh", energyDecorator.getDailyEnergyUsage());
        detail.put("累计运行小时", statsDecorator.getTotalRunningHours());
        detail.put("日均运行小时", statsDecorator.getAverageDailyRunningHours());
        detail.put("启动次数", statsDecorator.getStartCount());
        return detail;
    }

    @Transactional
    public void batchCreateDefaultDevices(Long zoneId) {
        DeviceType[] types = DeviceType.values();
        for (DeviceType type : types) {
            Device device = new Device();
            device.setName(type.getDescription() + "-Zone" + zoneId);
            device.setDeviceType(type);
            device.setZoneId(zoneId);
            device.setState(DeviceStateType.IDLE);
            device.setIsOnline(true);
            device.setPowerConsumption(100.0);
            device.setTotalRunningMinutes(0L);
            deviceRepository.save(device);
        }
        log.info("为区域 {} 创建了 {} 台默认设备", zoneId, types.length);
    }
}

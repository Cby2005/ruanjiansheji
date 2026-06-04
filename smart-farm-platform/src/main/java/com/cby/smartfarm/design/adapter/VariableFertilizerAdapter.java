package com.cby.smartfarm.design.adapter;

public class VariableFertilizerAdapter implements SmartActuatorPort {

    private final LegacyVariableFertilizer legacyFertilizer;

    public VariableFertilizerAdapter(LegacyVariableFertilizer legacyFertilizer) {
        this.legacyFertilizer = legacyFertilizer;
    }

    @Override
    public String getDeviceType() {
        return "FERTILIZER";
    }

    @Override
    public String execute(String area, String action, double value) {
        if (!"FERTILIZE".equalsIgnoreCase(action)) {
            return "变量施肥机不支持动作: " + action;
        }
        return legacyFertilizer.applyFertilizer(area, value);
    }
}

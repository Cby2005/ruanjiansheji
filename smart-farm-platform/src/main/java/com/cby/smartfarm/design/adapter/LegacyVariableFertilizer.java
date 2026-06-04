package com.cby.smartfarm.design.adapter;

public class LegacyVariableFertilizer {

    public String applyFertilizer(String plotNo, double kilogramPerMu) {
        return "第三方变量施肥机已在地块 " + plotNo + " 按 " + kilogramPerMu + " kg/亩执行精准施肥";
    }
}

package com.cby.smartfarm.drone;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DronePathPlannerTest {
    @Test
    void nearestUsesHaversineAndVisitsClosestPointFirst() {
        var start = point(null, "起点", 113.809058, 34.136323);
        var end = point(null, "终点", 113.809058, 34.136323);
        var far = point(1L, "远点", 113.809360, 34.136380);
        var near = point(2L, "近点", 113.809100, 34.136420);

        var plan = DronePathPlanner.plan(start, end, List.of(far, near), "NEAREST");

        assertEquals("近点", plan.points().get(1).name());
        assertEquals(64.31, plan.distanceMeters(), 0.1);
        assertEquals((int) Math.ceil(plan.distanceMeters() / 1.5), plan.estimatedSeconds());
    }

    private static DronePathPlanner.Point point(Long id, String name, double longitude, double latitude) {
        return new DronePathPlanner.Point(id, name, longitude, latitude, 1.5, "NORMAL", "A区", null);
    }
}

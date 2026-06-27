package com.cby.smartfarm.drone;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DronePathPlannerTest {
    @Test
    void nearestVisitsClosestPointFirstAndCalculates3dDistance() {
        var start = new DronePathPlanner.Point(null, "起点", 0, 0, 0);
        var end = new DronePathPlanner.Point(null, "终点", 0, 0, 0);
        var far = new DronePathPlanner.Point(1L, "远点", 6, 8, 0);
        var near = new DronePathPlanner.Point(2L, "近点", 3, 4, 0);

        var plan = DronePathPlanner.plan(start, end, List.of(far, near), "NEAREST");

        assertEquals("近点", plan.points().get(1).name());
        assertEquals(20D, plan.distanceMeters());
        assertEquals(0.22D, plan.minutes());
    }
}

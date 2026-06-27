package com.cby.smartfarm.drone;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class DronePathPlanner {
    private DronePathPlanner() {}

    public record Point(Long id, String name, double x, double y, double z) {}
    public record Plan(List<Point> points, double distanceMeters, double minutes) {}

    public static Plan plan(Point start, Point end, List<Point> inspectionPoints, String algorithm) {
        List<Point> ordered = "NEAREST".equalsIgnoreCase(algorithm)
                ? nearest(start, inspectionPoints)
                : new ArrayList<>(inspectionPoints);
        List<Point> route = new ArrayList<>();
        route.add(start);
        route.addAll(ordered);
        route.add(end);
        double distance = 0;
        for (int i = 1; i < route.size(); i++) {
            distance += distance(route.get(i - 1), route.get(i));
        }
        return new Plan(route, round(distance), round(distance / 1.5 / 60));
    }

    private static List<Point> nearest(Point start, List<Point> points) {
        List<Point> remaining = new ArrayList<>(points);
        List<Point> result = new ArrayList<>();
        Point current = start;
        while (!remaining.isEmpty()) {
            Point from = current;
            Point next = remaining.stream()
                    .min(Comparator.comparingDouble(p -> distance(from, p)))
                    .orElseThrow();
            result.add(next);
            remaining.remove(next);
            current = next;
        }
        return result;
    }

    static double distance(Point a, Point b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2));
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

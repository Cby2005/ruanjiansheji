package com.cby.smartfarm.drone;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record RouteGenerateRequest(
        @NotNull Long greenhouseId,
        @NotBlank String routeName,
        @NotBlank String routeType,
        @NotNull Double startX,
        @NotNull Double startY,
        @NotNull Double startZ,
        @NotNull Double endX,
        @NotNull Double endY,
        @NotNull Double endZ,
        @NotEmpty List<Long> pointIds,
        @NotBlank String algorithmType) {}

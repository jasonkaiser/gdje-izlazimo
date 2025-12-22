package com.gdje_izlazimo.project.dto.request.update;

import com.gdje_izlazimo.project.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record UpdateVenueOperatingHoursRequest(
        @NotNull(message = "Start day is required")
        DayOfWeek startDay,
        @NotNull(message = "End day is required")
        DayOfWeek endDay,
        @NotNull(message = "Open time is required")
        LocalTime openTime,
        @NotNull(message = "Closed time is required")
        LocalTime closedTime
) {
}
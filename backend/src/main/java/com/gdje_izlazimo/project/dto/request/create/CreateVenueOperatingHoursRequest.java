package com.gdje_izlazimo.project.dto.request.create;

import com.gdje_izlazimo.project.enums.DayOfWeek;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.UUID;

public record CreateVenueOperatingHoursRequest(
        @NotNull(message = "Venue ID is required")
        UUID venueId,
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
package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.DayOfWeek;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record VenueOperatingHoursResponse(
        UUID id,
        UUID venueId,
        DayOfWeek startDay,
        DayOfWeek endDay,
        LocalTime openTime,
        LocalTime closedTime,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
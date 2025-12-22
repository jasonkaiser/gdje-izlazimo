package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record CreateEventRequest(
        @NotNull(message = "Venue ID is required")
        UUID venueId,
        @NotNull(message = "Table Type ID is required")
        UUID tableTypeId,
        @NotNull(message = "Event start time is required")
        LocalTime eventStartTime,
        @NotNull(message = "Event date time is required")
        LocalDateTime eventDateTime,
        @NotBlank(message = "Name is required")
        String name,
        String imageUrl,
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity
) {
}
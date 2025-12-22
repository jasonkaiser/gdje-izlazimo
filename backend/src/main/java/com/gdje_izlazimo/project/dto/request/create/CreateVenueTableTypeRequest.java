package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateVenueTableTypeRequest(
        @NotNull(message = "Venue ID is required")
        UUID venueId,
        @NotNull(message = "Table Type ID is required")
        UUID tableTypeId,
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity
) {
}
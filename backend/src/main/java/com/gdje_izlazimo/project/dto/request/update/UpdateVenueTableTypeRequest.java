package com.gdje_izlazimo.project.dto.request.update;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateVenueTableTypeRequest(
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity
) {
}
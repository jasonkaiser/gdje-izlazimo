package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateRatingRequest(
        @NotNull(message = "Reservation ID is required")
        UUID reservationId,
        @NotNull(message = "User ID is required")
        UUID userId,
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer rating,
        String comment
) {
}
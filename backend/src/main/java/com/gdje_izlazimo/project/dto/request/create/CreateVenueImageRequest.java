package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateVenueImageRequest(
        @NotNull(message = "Venue ID is required")
        UUID venueId,
        @NotBlank(message = "Image URL is required")
        String imageUrl,
        @NotNull(message = "Is primary is required")
        Boolean isPrimary
) {
}
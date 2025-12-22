package com.gdje_izlazimo.project.dto.request.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateVenueImageRequest(
        @NotBlank(message = "Image URL is required")
        String imageUrl,
        @NotNull(message = "Is primary is required")
        Boolean isPrimary
) {
}
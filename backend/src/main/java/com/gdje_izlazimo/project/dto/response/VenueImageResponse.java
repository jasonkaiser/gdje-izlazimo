package com.gdje_izlazimo.project.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record VenueImageResponse(
        UUID id,
        UUID venueId,
        String imageUrl,
        boolean isPrimary,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
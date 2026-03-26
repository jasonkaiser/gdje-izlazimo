package com.gdje_izlazimo.project.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record VenueTableTypeResponse(
        UUID id,
        UUID venueId,
        UUID tableTypeId,
        String tableTypeName,
        String tableTypeDescription,
        int quantity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
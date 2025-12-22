package com.gdje_izlazimo.project.dto.response;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        UUID venueId,
        UUID tableTypeId,
        LocalTime eventStartTime,
        LocalDateTime eventDateTime,
        String name,
        String imageUrl,
        int quantity,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
package com.gdje_izlazimo.project.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record RatingResponse(
        UUID id,
        UUID reservationId,
        UUID userId,
        int rating,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
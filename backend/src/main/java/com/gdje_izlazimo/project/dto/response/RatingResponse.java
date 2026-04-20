package com.gdje_izlazimo.project.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record RatingResponse(
        UUID id,
        UUID venueId,
        UUID userId,
        String userName,
        String profileImageUrl,
        int rating,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
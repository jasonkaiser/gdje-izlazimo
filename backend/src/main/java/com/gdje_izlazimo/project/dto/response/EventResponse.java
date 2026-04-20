package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.VenueCategory;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        UUID venueId,
        String venueName,
        VenueCategory venueType,
        String venueAddress,
        String name,
        String description,
        LocalDateTime eventDateTime,
        String imageUrl,
        long viewCount,
        boolean trending,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
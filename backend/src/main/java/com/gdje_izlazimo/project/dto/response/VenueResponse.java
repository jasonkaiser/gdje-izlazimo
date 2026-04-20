package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.VenueKind;
import com.gdje_izlazimo.project.enums.WorkingDays;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record VenueResponse(

        UUID id,
        String name,
        String description,
        String addressName,
        boolean isActive,
        VenueCategory venueType,
        VenueKind venueKind,
        String phone,
        double latitude,
        double longitude,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<VenueImageResponse> images,
        double averageRating,
        long totalRatings
) {
}

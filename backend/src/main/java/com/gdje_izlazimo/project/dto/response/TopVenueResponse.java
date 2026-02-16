package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.VenueCategory;

import java.util.UUID;

public record TopVenueResponse(
        UUID venueId,
        String venueName,
        String addressName,
        VenueCategory venueType,
        Boolean isActive,
        Long reservationCount
) {
}
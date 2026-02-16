package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.VenueCategory;

public record VenueTypeBreakdownResponse(
        VenueCategory venueType,
        Long count,
        Double percentage
) {
}
package com.gdje_izlazimo.project.dto.request.create;

import com.gdje_izlazimo.project.enums.VenueCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateVenueRequest(
        @NotBlank(message = "Name is required")
        @Size(min = 4, message = "Name must have minimum 4 characters")
        String name,

        String description,

        @NotBlank(message = "Address is required")
        String addressName,

        @NotNull(message = "Activity is required")
        Boolean isActive,

        @NotNull(message = "Category is required")
        VenueCategory venueType,

        @NotBlank(message = "Phone is required")
        String phone,

        @NotNull(message = "Latitude is required")
        Double latitude,

        @NotNull(message = "Longitude is required")
        Double longitude,

        @NotNull(message = "Venue Owner is required")
        UUID venueOwnerId

        ) {
}

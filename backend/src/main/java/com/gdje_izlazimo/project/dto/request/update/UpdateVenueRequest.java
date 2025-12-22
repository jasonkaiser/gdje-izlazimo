package com.gdje_izlazimo.project.dto.request.update;

import com.gdje_izlazimo.project.enums.VenueCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateVenueRequest(

        @NotBlank(message = "Name is required")
        @Size(min = 4, message = "Name must have minimum 4 characters")
        String name,

        String description,

        @NotNull(message = "Activity is required")
        Boolean isActive,

        @NotNull(message = "Category is required")
        VenueCategory venueType,

        @NotBlank(message = "Phone is required")
        String phone
) {
}

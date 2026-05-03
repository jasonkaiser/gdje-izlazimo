package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.validation.constraints.*;


public record CreateEventRequest(

        @NotNull(message = "Venue ID is required")
        UUID venueId,

        @NotBlank(message = "Event name is required")
        @Size(max = 150, message = "Event name must not exceed 150 characters")
        String name,

        String description,

        @NotNull(message = "Event date/time is required")
        @Future(message = "Event date/time must be in the future")
        LocalDateTime eventDateTime,

        String imageUrl

) {}
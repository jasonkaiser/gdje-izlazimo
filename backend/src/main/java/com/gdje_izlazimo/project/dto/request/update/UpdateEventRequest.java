package com.gdje_izlazimo.project.dto.request.update;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record UpdateEventRequest(

        @Size(max = 150, message = "Event name must not exceed 150 characters")
        String name,

        @Size(max = 1000, message = "Description must not exceed 1000 characters")
        String description,

        @Future(message = "Event date/time must be in the future")
        LocalDateTime eventDateTime,

        String imageUrl
) {}

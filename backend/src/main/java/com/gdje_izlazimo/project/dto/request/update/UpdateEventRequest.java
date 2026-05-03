package com.gdje_izlazimo.project.dto.request.update;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record UpdateEventRequest(

        @Size(max = 150, message = "Event name must not exceed 150 characters")
        String name,

        String description,

        @Future(message = "Event date/time must be in the future")
        LocalDateTime eventDateTime,

        String imageUrl
) {}

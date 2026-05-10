package com.gdje_izlazimo.project.dto.request.create;

import com.gdje_izlazimo.project.enums.EventType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CreateEventRequest(

        UUID venueId,

        @NotBlank(message = "Event name is required")
        @Size(max = 150, message = "Event name must not exceed 150 characters")
        String name,

        String description,

        @NotNull(message = "Event date/time is required")
        @Future(message = "Event date/time must be in the future")
        LocalDateTime eventDateTime,

        LocalDateTime eventEndDateTime,

        String locationName,
        String locationAddress,

        EventType eventType,

        String externalOrganizerName,
        String externalOrganizerInstagram,

        Boolean featured,

        Double latitude,
        Double longitude,

        @Valid
        List<EventTicketTypeRequest> ticketTypes
) {}
package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.EventType;
import com.gdje_izlazimo.project.enums.VenueCategory;

import java.time.LocalDateTime;
import java.util.List;
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
        LocalDateTime eventEndDateTime,

        String locationName,
        String locationAddress,

        String displayLocationName,
        String displayLocationAddress,

        EventType eventType,
        String externalOrganizerName,
        String externalOrganizerInstagram,
        boolean featured,

        String imageUrl,

        List<EventTicketTypeResponse> ticketTypes,
        boolean hasTickets,
        String primaryTicketUrl,

        long viewCount,
        boolean trending,

        Double latitude,
        Double longitude,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
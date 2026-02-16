package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.enums.Status;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record ReservationResponse(
        UUID id,
        UUID userId,
        UUID venueId,
        String phone,
        String venueName,
        String venueAddress,
        LocalDate reservationDate,
        LocalTime reservationTime,
        Integer numberOfPeople,
        UUID tableTypeId,
        Status status,
        String specialRequests,
        String rejectReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
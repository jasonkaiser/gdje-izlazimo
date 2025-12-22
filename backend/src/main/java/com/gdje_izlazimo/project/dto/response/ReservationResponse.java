package com.gdje_izlazimo.project.dto.response;

import com.gdje_izlazimo.project.entity.TableType;
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
        LocalDate reservationDate,
        LocalTime reservationTime,
        int numberOfPeople,
        TableType tableType,
        Status status,
        String specialRequests,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}

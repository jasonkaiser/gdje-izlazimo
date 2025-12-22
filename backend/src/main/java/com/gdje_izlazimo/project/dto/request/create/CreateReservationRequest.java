package com.gdje_izlazimo.project.dto.request.create;

import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.enums.Status;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record CreateReservationRequest(
        @NotNull(message = "User ID is required")
        UUID userId,
        @NotNull(message = "Venue ID is required")
        UUID venueId,
        @NotBlank(message = "Phone is required")
        String phone,
        @NotNull(message = "Reservation Date is required")
        LocalDate reservationDate,
        @NotNull(message = "Reservation Time is required")
        LocalTime reservationTime,
        @NotNull(message = "Table Type is required")
        TableType tableType,
        @Min(value = 1, message = "Number of people must be at least 1")
        int numberOfPeople,
        @NotNull(message = "Status is required")
        Status status,
        String specialRequests


) {
}

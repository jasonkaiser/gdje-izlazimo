package com.gdje_izlazimo.project.dto.response;

public record ReservationStatusBreakdownResponse(
        String status,
        Long count,
        Double percentage
) {
}
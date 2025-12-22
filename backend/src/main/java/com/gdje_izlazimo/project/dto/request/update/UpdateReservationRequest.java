package com.gdje_izlazimo.project.dto.request.update;

import com.gdje_izlazimo.project.enums.Status;
import jakarta.validation.constraints.NotNull;

public record UpdateReservationRequest(

        @NotNull(message = "Status is required")
        Status status
) {
}

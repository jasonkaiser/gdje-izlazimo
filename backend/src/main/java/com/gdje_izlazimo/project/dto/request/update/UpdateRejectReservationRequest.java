package com.gdje_izlazimo.project.dto.request.update;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateRejectReservationRequest(
        @Size(max = 500)
        String reason
) {}

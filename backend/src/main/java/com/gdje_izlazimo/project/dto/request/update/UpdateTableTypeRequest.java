package com.gdje_izlazimo.project.dto.request.update;

import jakarta.validation.constraints.NotBlank;

public record UpdateTableTypeRequest(
        @NotBlank(message = "Name is required")
        String name,
        String description
) {
}
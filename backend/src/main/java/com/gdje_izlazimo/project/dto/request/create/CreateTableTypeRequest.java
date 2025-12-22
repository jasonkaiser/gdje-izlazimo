package com.gdje_izlazimo.project.dto.request.create;

import jakarta.validation.constraints.NotBlank;

public record CreateTableTypeRequest(
        @NotBlank(message = "Name is required")
        String name,
        String description
) {
}
package com.gdje_izlazimo.project.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record TableTypeResponse(
        UUID id,
        String name,
        String description,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
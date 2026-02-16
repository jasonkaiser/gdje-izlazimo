package com.gdje_izlazimo.project.dto.response;



import com.gdje_izlazimo.project.enums.ActionType;
import com.gdje_izlazimo.project.enums.ActivityStatus;
import com.gdje_izlazimo.project.enums.EntityType;

import java.time.LocalDateTime;
import java.util.UUID;

public record ActivityLogResponse(
        UUID id,
        EntityType entityType,
        UUID entityId,
        String entityName,
        ActionType actionType,
        String message,
        ActivityStatus status,
        String performedBy,
        LocalDateTime createdAt
) {
}
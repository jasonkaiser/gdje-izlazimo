package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.response.ActivityLogResponse;
import com.gdje_izlazimo.project.entity.ActivityLog;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ActivityLogMapper {

    public ActivityLogResponse toResponse(ActivityLog entity) {
        return new ActivityLogResponse(
                entity.getId(),
                entity.getEntityType(),
                UUID.fromString(entity.getEntityId()),
                entity.getEntityName(),
                entity.getActionType(),
                entity.getMessage(),
                entity.getStatus(),
                entity.getPerformedBy(),
                entity.getCreatedAt()
        );
    }
}
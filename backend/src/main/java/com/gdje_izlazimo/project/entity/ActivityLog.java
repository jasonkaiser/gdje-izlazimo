package com.gdje_izlazimo.project.entity;

import com.gdje_izlazimo.project.enums.ActionType;
import com.gdje_izlazimo.project.enums.ActivityStatus;
import com.gdje_izlazimo.project.enums.EntityType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "activity_logs", indexes = {
        @Index(name = "idx_created_at", columnList = "created_at"),
        @Index(name = "idx_entity_type", columnList = "entity_type"),
        @Index(name = "idx_entity_id", columnList = "entity_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "entity_type", nullable = false, length = 50)
    private EntityType entityType;

    @Column(name = "entity_id", nullable = false, length = 100)
    private String entityId;

    @Column(name = "entity_name", length = 255)
    private String entityName;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 50)
    private ActionType actionType;

    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private ActivityStatus status;

    @Column(name = "performed_by", length = 100)
    private String performedBy;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;



}
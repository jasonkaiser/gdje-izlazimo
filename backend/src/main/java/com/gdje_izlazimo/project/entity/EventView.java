package com.gdje_izlazimo.project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "event_views", indexes = {
        @Index(name = "idx_event_view_event_id", columnList = "event_id"),
        @Index(name = "idx_event_view_viewed_at", columnList = "viewed_at")
})
@EntityListeners(AuditingEntityListener.class)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EventView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "viewer_ip", length = 45)
    private String viewerIp;  // optional — for dedup

    @CreatedDate
    @Column(name = "viewed_at", nullable = false, updatable = false)
    private LocalDateTime viewedAt;
}

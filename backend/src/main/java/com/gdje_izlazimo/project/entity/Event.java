package com.gdje_izlazimo.project.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "events")
@EntityListeners(AuditingEntityListener.class)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Event {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false, updatable = false)
    private Venue venueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_type_id", nullable = false, updatable = false)
    private TableType tableTypeId;

    @Column(name = "event_start_time", nullable = false)
    private LocalTime eventStartTime;

    @Column(name = "event_date_time", nullable = false)
    private LocalDateTime eventDateTime;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "quantity", nullable = false)
    private int quantity;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;

}
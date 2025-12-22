package com.gdje_izlazimo.project.entity;

import com.gdje_izlazimo.project.enums.DayOfWeek;
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
@Table(name = "venue_operating_hours")
@EntityListeners(AuditingEntityListener.class)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class VenueOperatingHours {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false, updatable = false)
    private Venue venueId;

    @Column(name = "start_day", nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek startDay;

    @Column(name = "end_day", nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek endDay;

    @Column(name = "open_time", nullable = false)
    private LocalTime openTime;

    @Column(name = "closed_time", nullable = false)
    private LocalTime closedTime;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;

}
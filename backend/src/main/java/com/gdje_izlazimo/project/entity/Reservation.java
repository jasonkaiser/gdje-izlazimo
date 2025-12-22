package com.gdje_izlazimo.project.entity;

import com.gdje_izlazimo.project.enums.Status;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "reservations")
@EntityListeners(AuditingEntityListener.class)
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Reservation {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, updatable = false)
    private User userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id", nullable = false, updatable = false)
    private Venue venueId;

    @Column(name = "phone", nullable = false, updatable = false)
    private String phone;

    @Column(name = "reservation_date", nullable = false, updatable = false)
    private LocalDate reservationDate;

    @Column(name = "reservation_time", nullable = false, updatable = false)
    private LocalTime reservationTime;

    @Column(name = "number_of_people", nullable = false, updatable = false)
    private int numberOfPeople;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_type_id")
    private TableType tableType;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(name = "special_requests")
    private String specialRequests;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;


}

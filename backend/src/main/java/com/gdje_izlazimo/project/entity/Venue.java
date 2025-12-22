package com.gdje_izlazimo.project.entity;


import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.WorkingDays;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "venues")
@EntityListeners(AuditingEntityListener.class)
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Venue {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_owner_id", nullable = false, updatable = false)
    private User venueOwner;

    @Column(name = "address_name", nullable = false, updatable = false)
    private String addressName;

    @Column(name = "is_active", nullable = false, updatable = false)
    private boolean isActive;

    @Column(name = "venue_type", nullable = false, updatable = false)
    @Enumerated(EnumType.STRING)
    private VenueCategory venueType;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "latitude", nullable = false, updatable = false)
    private double latitude;

    @Column(name = "longitude", nullable = false, updatable = false)
    private double longitude;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime created_at;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updated_at;
}

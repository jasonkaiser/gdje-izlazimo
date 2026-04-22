package com.gdje_izlazimo.project.entity;


import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.VenueKind;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "venues", indexes = {
        @Index(name = "idx_venue_type", columnList = "venue_type"),
        @Index(name = "idx_venue_is_active", columnList = "is_active"),
        @Index(name = "idx_venue_name", columnList = "name"),
        @Index(name = "idx_venue_kind", columnList = "venue_kind"),

})
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
    @JoinColumn(name = "venue_owner_id", nullable = true, updatable = false)
    private User venueOwner;

    @Column(name = "address_name", nullable = false)
    private String addressName;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "venue_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private VenueCategory venueType;

    @Column(name = "venue_kind", nullable = false)
    @Enumerated(EnumType.STRING)
    private VenueKind venueKind;

    @Column(name = "phone", nullable = false)
    private String phone;

    @Column(name = "instagram", nullable = false)
    private String instagram;

    @Column(name = "latitude", nullable = false, updatable = false)
    private double latitude;

    @Column(name = "longitude", nullable = false, updatable = false)
    private double longitude;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<VenueImage> images = new ArrayList<>();
}

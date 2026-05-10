package com.gdje_izlazimo.project.entity;

import com.gdje_izlazimo.project.enums.EventType;
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
@Table(name = "events", indexes = {
        @Index(name = "idx_event_venue_id",   columnList = "venue_id"),
        @Index(name = "idx_event_date_time",  columnList = "event_date_time"),
        @Index(name = "idx_events_event_type",columnList = "event_type"),
        @Index(name = "idx_events_city",      columnList = "city"),
        @Index(name = "idx_events_is_featured",columnList = "is_featured")
})
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
    @JoinColumn(name = "venue_id", nullable = true)
    private Venue venue;

    @Column(name = "event_date_time", nullable = false)
    private LocalDateTime eventDateTime;

    @Column(name = "event_end_date_time")
    private LocalDateTime eventEndDateTime;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "location_name", length = 255)
    private String locationName;

    @Column(name = "location_address", length = 500)
    private String locationAddress;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 50)
    private EventType eventType = EventType.OTHER;

    @Column(name = "external_organizer_name", length = 255)
    private String externalOrganizerName;

    @Column(name = "external_organizer_instagram", length = 255)
    private String externalOrganizerInstagram;

    @Column(name = "is_featured", nullable = false)
    private Boolean featured = false;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_file_id")
    private String imageFileId;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<EventTicketType> ticketTypes = new ArrayList<>();

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;



    public void replaceTicketTypes(List<EventTicketType> incoming) {
        this.ticketTypes.clear();
        if (incoming != null) {
            incoming.forEach(t -> t.setEvent(this));
            this.ticketTypes.addAll(incoming);
        }
    }
}
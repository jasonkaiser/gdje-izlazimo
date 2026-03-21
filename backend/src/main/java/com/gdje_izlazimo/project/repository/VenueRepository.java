package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.VenueCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {

    boolean existsByName(String name);

    Page<Venue> findByVenueType(Pageable pageable, VenueCategory venueCategory);

    @Query("SELECT v FROM Venue v WHERE " +
            "(:query IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(v.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:category IS NULL OR v.venueType = :category)")
    Page<Venue> searchVenues(
            @Param("query") String query,
            @Param("category") VenueCategory category,
            Pageable pageable
    );

    Optional<Venue> findByVenueOwner_Id(UUID ownerId);


    Long countByActive(boolean active);


    @Query("SELECT v.venueType as type, COUNT(v) as count " +
            "FROM Venue v " +
            "GROUP BY v.venueType")
    List<VenueTypeBreakdown> getVenueTypeBreakdown();


    @Query("SELECT v.id as venueId, v.name as venueName, v.addressName as addressName, " +
            "v.venueType as venueType, v.active as isActive, COUNT(r.id) as reservationCount " +
            "FROM Venue v " +
            "LEFT JOIN Reservation r ON r.venue.id = v.id " +
            "GROUP BY v.id, v.name, v.addressName, v.venueType, v.active " +
            "ORDER BY COUNT(r.id) DESC")
    List<TopVenueProjection> getTopVenuesByReservations();


    interface VenueTypeBreakdown {
        VenueCategory getType();
        Long getCount();
    }


    interface TopVenueProjection {
        UUID getVenueId();
        String getVenueName();
        String getAddressName();
        VenueCategory getVenueType();
        Boolean getActive();
        Long getReservationCount();
    }
}
package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.VenueCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
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

}

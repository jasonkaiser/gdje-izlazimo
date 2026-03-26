package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.VenueImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VenueImageRepository extends JpaRepository<VenueImage, UUID> {

    @Query("SELECT vi FROM VenueImage vi JOIN FETCH vi.venue")
    List<VenueImage> findAllWithVenue();

    @Query("SELECT vi FROM VenueImage vi JOIN FETCH vi.venue WHERE vi.venue.id = :venueId")
    List<VenueImage> findByVenueIdWithVenue(@Param("venueId") UUID venueId);

    List<VenueImage> findByVenue_Id(UUID venueId);

    Optional<VenueImage> findByVenue_IdAndPrimaryTrue(UUID venueId);

}
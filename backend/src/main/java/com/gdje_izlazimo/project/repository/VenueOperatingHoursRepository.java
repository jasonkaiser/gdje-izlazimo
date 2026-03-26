package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.VenueOperatingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface VenueOperatingHoursRepository extends JpaRepository<VenueOperatingHours, UUID> {

    @Query("SELECT voh FROM VenueOperatingHours voh JOIN FETCH voh.venue")
    List<VenueOperatingHours> findAllWithVenue();

    Optional<VenueOperatingHours> findByVenue_Id(UUID venueId);
}
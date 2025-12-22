package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.VenueCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VenueRepository extends JpaRepository<Venue, UUID> {

    boolean existsByName(String name);
    List<Venue> findByVenueType(VenueCategory venueCategory);

}

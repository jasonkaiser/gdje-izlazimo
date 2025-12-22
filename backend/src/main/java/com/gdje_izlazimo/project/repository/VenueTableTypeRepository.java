package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.VenueTableType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface VenueTableTypeRepository extends JpaRepository<VenueTableType, UUID> {

    boolean existsByVenueId_IdAndTableTypeId_Id(UUID venueId, UUID tableTypeId);

}
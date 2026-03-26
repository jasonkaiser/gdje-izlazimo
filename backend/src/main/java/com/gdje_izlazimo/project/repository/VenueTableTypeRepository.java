package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.VenueTableType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface VenueTableTypeRepository extends JpaRepository<VenueTableType, UUID> {

    @Query("SELECT vtt FROM VenueTableType vtt " +
            "JOIN FETCH vtt.venue " +
            "JOIN FETCH vtt.tableType " +
            "WHERE vtt.venue.id = :venueId")
    List<VenueTableType> findByVenueIdWithVenueAndTableType(@Param("venueId") UUID venueId);

    @Query("SELECT vtt FROM VenueTableType vtt " +
            "JOIN FETCH vtt.venue " +
            "JOIN FETCH vtt.tableType")
    List<VenueTableType> findAllWithVenueAndTableType();

    boolean existsByVenue_IdAndTableType_Id(UUID venueId, UUID tableTypeId);
}
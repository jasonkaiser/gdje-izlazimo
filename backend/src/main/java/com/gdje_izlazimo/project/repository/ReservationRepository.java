package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    boolean existsByUserId_IdAndVenueId_Id(UUID userId, UUID venueId);

}

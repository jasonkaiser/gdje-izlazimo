package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    boolean existsByUserId_IdAndVenueId_Id(UUID userId, UUID venueId);

    Page<Reservation> findByVenueId_Id(UUID venueId, Pageable pageable);

    Page<Reservation> findByUserId_Id(UUID userId, Pageable pageable);

    boolean existsByUserId_IdAndVenueId_IdAndReservationDate(UUID userId, UUID venueId, LocalDate reservationDate);


}

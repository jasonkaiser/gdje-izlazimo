package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    boolean existsByUserId_IdAndVenueId_Id(UUID userId, UUID venueId);

    Page<Reservation> findByVenueId_Id(UUID venueId, Pageable pageable);

    Page<Reservation> findByUserId_Id(UUID userId, Pageable pageable);

    boolean existsByUserId_IdAndVenueId_IdAndReservationDate(UUID userId, UUID venueId, LocalDate reservationDate);

    @Query("""
      select new com.gdje_izlazimo.project.dto.response.ReservationResponse(
        r.id,
        u.id,
        v.id,
        v.addressName,
        v.name,
        r.phone,
        r.reservationDate,
        r.reservationTime,
        r.numberOfPeople,
        r.tableType,
        r.status,
        r.specialRequests,
        r.created_at,
        r.updated_at
      )
      from Reservation r
      join r.userId u
      join r.venueId v
      left join r.tableType tt
      where u.id = :userId
    """)
        Page<ReservationResponse> findResponsesByUserId(@Param("userId") UUID userId, Pageable pageable);

    boolean existsByUserId_IdAndVenueId_IdAndReservationDateAndReservationTime(
            UUID userId, UUID venueId, LocalDate reservationDate, LocalTime reservationTime
    );
}

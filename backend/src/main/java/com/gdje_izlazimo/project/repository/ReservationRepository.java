package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Query("SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.venue v " +
            "LEFT JOIN FETCH r.user u " +
            "LEFT JOIN FETCH r.tableType t " +
            "WHERE r.id = :id")
    Optional<Reservation> findByIdWithDetails(@Param("id") UUID id);

    @Query("SELECT r FROM Reservation r " +
            "LEFT JOIN FETCH r.venue v " +
            "LEFT JOIN FETCH r.user u " +
            "LEFT JOIN FETCH r.tableType t " +
            "WHERE v.id = :venueId")
    Page<Reservation> findByVenue_IdWithDetails(@Param("venueId") UUID venueId, Pageable pageable);

    Page<Reservation> findByVenue_Id(UUID venueId, Pageable pageable);

    @Query("SELECT new com.gdje_izlazimo.project.dto.response.ReservationResponse(" +
            "r.id, r.user.id, r.venue.id, r.phone, r.venue.name, r.venue.addressName, " +
            "r.reservationDate, r.reservationTime, r.numberOfPeople, r.tableType.id, " +
            "r.status, r.specialRequests, r.rejectReason, r.createdAt, r.updatedAt) " +
            "FROM Reservation r " +
            "WHERE r.user.id = :userId")
    Page<ReservationResponse> findResponsesByUserId(@Param("userId") UUID userId, Pageable pageable);

    boolean existsByUser_IdAndVenue_IdAndReservationDateAndReservationTime(
            UUID userId, UUID venueId, LocalDate reservationDate, LocalTime reservationTime);

    Long countByStatus(Status status);


    @Query("SELECT r.status as status, COUNT(r) as count " +
            "FROM Reservation r " +
            "GROUP BY r.status")
    List<ReservationStatusBreakdown> getReservationStatusBreakdown();


    @Query(value = "SELECT * FROM reservations ORDER BY created_at DESC LIMIT :limit",
            nativeQuery = true)
    List<Reservation> findTopNRecentReservations(@Param("limit") int limit);

    @Query("""
    SELECT r FROM Reservation r
    JOIN FETCH r.user
    JOIN FETCH r.venue v
    JOIN FETCH v.venueOwner
    JOIN FETCH r.tableType
    ORDER BY r.id ASC
    """)
    Page<Reservation> findAllWithDetails(Pageable pageable);


    interface ReservationStatusBreakdown {
        String getStatus();
        Long getCount();
    }
}
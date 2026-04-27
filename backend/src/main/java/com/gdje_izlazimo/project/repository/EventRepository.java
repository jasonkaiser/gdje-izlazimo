package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    @Query(value = """
    SELECT e FROM Event e
    JOIN FETCH e.venue v
    JOIN FETCH v.venueOwner
    ORDER BY e.eventDateTime ASC
    """,
            countQuery = "SELECT COUNT(e) FROM Event e")
    Page<Event> findAllWithDetails(Pageable pageable);

    @Query(value = """
    SELECT e FROM Event e
    JOIN FETCH e.venue v
    JOIN FETCH v.venueOwner
    WHERE v.id = :venueId
    ORDER BY e.eventDateTime ASC
    """,
            countQuery = "SELECT COUNT(e) FROM Event e WHERE e.venue.id = :venueId")
    Page<Event> findByVenueIdWithDetails(@Param("venueId") UUID venueId, Pageable pageable);

    @Query(value = "SELECT e FROM Event e " +
            "JOIN FETCH e.venue v " +
            "JOIN FETCH v.venueOwner " +
            "WHERE (CAST(:dateFrom AS java.time.LocalDateTime) IS NULL OR e.eventDateTime >= :dateFrom) " +
            "AND (CAST(:dateTo AS java.time.LocalDateTime) IS NULL OR e.eventDateTime <= :dateTo)",
            countQuery = "SELECT COUNT(e) FROM Event e " +
                    "WHERE (CAST(:dateFrom AS java.time.LocalDateTime) IS NULL OR e.eventDateTime >= :dateFrom) " +
                    "AND (CAST(:dateTo AS java.time.LocalDateTime) IS NULL OR e.eventDateTime <= :dateTo)")
    Page<Event> findAllFiltered(
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo")   LocalDateTime dateTo,
            Pageable pageable
    );

    @Query(value = "SELECT e FROM Event e " +
            "JOIN FETCH e.venue v " +
            "JOIN FETCH v.venueOwner " +
            "WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "AND (CAST(:dateFrom AS java.time.LocalDateTime) IS NULL OR e.eventDateTime >= :dateFrom) " +
            "AND (CAST(:dateTo AS java.time.LocalDateTime) IS NULL OR e.eventDateTime <= :dateTo)",
            countQuery = "SELECT COUNT(e) FROM Event e " +
                    "WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
                    "AND (CAST(:dateFrom AS java.time.LocalDateTime) IS NULL OR e.eventDateTime >= :dateFrom) " +
                    "AND (CAST(:dateTo AS java.time.LocalDateTime) IS NULL OR e.eventDateTime <= :dateTo)")
    Page<Event> searchByQuery(
            @Param("query")    String query,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo")   LocalDateTime dateTo,
            Pageable pageable
    );

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.venue v
        JOIN FETCH v.venueOwner
        WHERE e.id = :id
        """)
    Optional<Event> findByIdWithDetails(@Param("id") UUID id);

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.venue v
        JOIN FETCH v.venueOwner
        WHERE e.eventDateTime > :now
        ORDER BY e.eventDateTime ASC
        """)
    List<Event> findUpcomingEvents(@Param("now") LocalDateTime now);

    boolean existsByIdAndVenue_VenueOwner_Id(UUID eventId, UUID ownerId);
}
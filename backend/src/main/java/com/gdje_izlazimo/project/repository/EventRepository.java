package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    @Query(value = """
    SELECT e FROM Event e
    JOIN FETCH e.venue v
    JOIN FETCH v.venueOwner
    WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))
    """,
            countQuery = "SELECT COUNT(e) FROM Event e WHERE LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Event> searchByQuery(@Param("query") String query, Pageable pageable);

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.venue v
        JOIN FETCH v.venueOwner
        WHERE e.id = :id
        """)
    Optional<Event> findByIdWithDetails(@Param("id") UUID id);



    boolean existsByIdAndVenue_VenueOwner_Id(UUID eventId, UUID ownerId);

}
package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.entity.EventView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EventViewRepository extends JpaRepository<EventView, UUID> {

    @Query("""
        SELECT e FROM Event e
        JOIN FETCH e.venue v
        JOIN FETCH v.venueOwner
        WHERE e.id IN (
            SELECT ev.event.id FROM EventView ev
            WHERE ev.viewedAt >= :since
            GROUP BY ev.event.id
            ORDER BY COUNT(ev.id) DESC
            LIMIT :limit
        )
        """)
    List<Event> findTrendingEvents(
            @Param("since") LocalDateTime since,
            @Param("limit") int limit
    );

    @Query("SELECT COUNT(ev) FROM EventView ev WHERE ev.event.id = :eventId")
    long countByEventId(@Param("eventId") UUID eventId);

    @Query("""
        SELECT ev.event.id, COUNT(ev)
        FROM EventView ev
        WHERE ev.event.id IN :eventIds
        GROUP BY ev.event.id
        """)
    List<Object[]> countByEventIds(@Param("eventIds") List<UUID> eventIds);


    @Query("""
    SELECT COUNT(ev) > 0 FROM EventView ev
    WHERE ev.event.id = :eventId
    AND ev.viewerIp = :ip
    AND ev.viewedAt >= :since
    """)
    boolean existsRecentView(
            @Param("eventId") UUID eventId,
            @Param("ip") String ip,
            @Param("since") LocalDateTime since
    );
}

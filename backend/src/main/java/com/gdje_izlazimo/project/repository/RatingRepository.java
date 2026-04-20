package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

    boolean existsByVenue_IdAndUser_Id(UUID venueId, UUID userId);

    @Query("SELECT r FROM Rating r " +
            "JOIN FETCH r.user " +
            "JOIN FETCH r.venue " +
            "WHERE r.venue.id = :venueId")
    List<Rating> findByVenueIdWithDetails(@Param("venueId") UUID venueId);

    @Query("SELECT r FROM Rating r JOIN FETCH r.venue JOIN FETCH r.user WHERE r.id = :id")
    Optional<Rating> findByIdWithVenue(@Param("id") UUID id);

    @Query(value = "SELECT r FROM Rating r JOIN FETCH r.user JOIN FETCH r.venue",
            countQuery = "SELECT COUNT(r) FROM Rating r")
    Page<Rating> findAllWithDetails(Pageable pageable);

    @Query("SELECT AVG(r.rating) FROM Rating r WHERE r.venue.id = :venueId")
    Double findAverageRatingByVenueId(@Param("venueId") UUID venueId);

    long countByVenue_Id(UUID venueId);

}
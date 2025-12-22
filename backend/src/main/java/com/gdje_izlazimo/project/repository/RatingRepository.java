package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RatingRepository extends JpaRepository<Rating, UUID> {

    boolean existsByReservationId_IdAndUserId_Id(UUID reservationId, UUID userId);

}
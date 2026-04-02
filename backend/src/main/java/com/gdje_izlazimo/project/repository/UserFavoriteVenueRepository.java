package com.gdje_izlazimo.project.repository;

import com.gdje_izlazimo.project.entity.UserFavoriteVenue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserFavoriteVenueRepository extends JpaRepository<UserFavoriteVenue, UUID> {

    List<UserFavoriteVenue> findByUser_Id(UUID userId);
    boolean existsByUser_IdAndVenue_Id(UUID userId, UUID venueId);
    void deleteByUser_IdAndVenue_Id(UUID userId, UUID venueId);

}

package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.UserFavoriteVenue;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.exception.custom.FavoriteAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.FavoriteNotFoundException;
import com.gdje_izlazimo.project.exception.custom.UserNotFoundException;
import com.gdje_izlazimo.project.exception.custom.VenueNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueMapper;
import com.gdje_izlazimo.project.repository.UserFavoriteVenueRepository;
import com.gdje_izlazimo.project.repository.UserRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserFavoriteVenueService {

    private final UserFavoriteVenueRepository favoriteRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    public UserFavoriteVenueService(
            UserFavoriteVenueRepository favoriteRepository,
            UserRepository userRepository,
            VenueRepository venueRepository,
            VenueMapper venueMapper
    ) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    @Transactional
    public void addFavorite(UUID userId, UUID venueId) {
        if (favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)) {
            throw new FavoriteAlreadyExistsException("Venue is already in your favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new VenueNotFoundException("Venue not found"));

        UserFavoriteVenue entity = new UserFavoriteVenue();
        entity.setUser(user);
        entity.setVenue(venue);

        favoriteRepository.save(entity);
    }

    @Transactional
    public void removeFavorite(UUID userId, UUID venueId) {
        if (!favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)) {
            throw new FavoriteNotFoundException("Venue is not in your favorites");
        }
        favoriteRepository.deleteByUser_IdAndVenue_Id(userId, venueId);
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> getFavorites(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new UserNotFoundException("User not found");
        }
        return favoriteRepository.findByUser_Id(userId)
                .stream()
                .map(f -> venueMapper.toResponse(f.getVenue()))
                .toList();
    }
}
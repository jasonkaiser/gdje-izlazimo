package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.dto.response.VenueRatingStatsResponse;
import com.gdje_izlazimo.project.entity.Rating;
import com.gdje_izlazimo.project.exception.custom.RatingAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.RatingNotFoundException;
import com.gdje_izlazimo.project.mapper.RatingMapper;
import com.gdje_izlazimo.project.repository.RatingRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RatingMapper ratingMapper;

    public RatingService(RatingRepository ratingRepository, RatingMapper ratingMapper) {
        this.ratingRepository = ratingRepository;
        this.ratingMapper = ratingMapper;
    }

    public List<RatingResponse> findAllRatings(Pageable pageable) {
        return ratingRepository.findAllWithDetails(pageable)
                .getContent()
                .stream()
                .map(ratingMapper::toResponse)
                .toList();
    }

    public RatingResponse findRatingById(UUID id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RatingNotFoundException("Rating does not exist"));
        return ratingMapper.toResponse(rating);
    }

    public List<RatingResponse> findByVenueId(UUID venueId) {
        return ratingRepository.findByVenueIdWithDetails(venueId)
                .stream()
                .map(ratingMapper::toResponse)
                .toList();
    }

    public VenueRatingStatsResponse getVenueRatingStats(UUID venueId) {
        Double avg = ratingRepository.findAverageRatingByVenueId(venueId);
        long count = ratingRepository.countByVenue_Id(venueId);
        return new VenueRatingStatsResponse(
                avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                count
        );
    }

    public RatingResponse createRating(CreateRatingRequest dto) {
        if (ratingRepository.existsByVenue_IdAndUser_Id(dto.venueId(), dto.userId())) {
            throw new RatingAlreadyExistsException("You have already rated this venue");
        }
        Rating created = ratingMapper.toEntity(dto);
        return ratingMapper.toResponse(ratingRepository.save(created));
    }

    public RatingResponse updateRating(UpdateRatingRequest dto, UUID id) {
        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new RatingNotFoundException("Rating does not exist"));
        ratingMapper.updateEntity(dto, rating);
        return ratingMapper.toResponse(ratingRepository.save(rating));
    }

    public void deleteRating(UUID id) {
        if (!ratingRepository.existsById(id)) {
            throw new RatingNotFoundException("Rating does not exist");
        }
        ratingRepository.deleteById(id);
    }
}
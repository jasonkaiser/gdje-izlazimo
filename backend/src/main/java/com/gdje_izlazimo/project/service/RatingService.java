package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.entity.Rating;
import com.gdje_izlazimo.project.exception.custom.RatingAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.RatingNotFoundException;
import com.gdje_izlazimo.project.mapper.RatingMapper;
import com.gdje_izlazimo.project.repository.RatingRepository;
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

    public List<RatingResponse> findAllRatings(){

        List<Rating> responses = ratingRepository.findAll();

        return responses.stream()
                .map(ratingMapper::toResponse)
                .toList();

    }

    public RatingResponse findRatingById(UUID id){

        Rating response = ratingRepository.findById(id).orElseThrow(
                () -> new RatingNotFoundException("Rating does not exist"));

        return ratingMapper.toResponse(response);

    }

    public RatingResponse createRating(CreateRatingRequest dto){

        if (ratingRepository.existsByReservationId_IdAndUserId_Id(dto.reservationId(), dto.userId())) {
            throw new RatingAlreadyExistsException("You already rated this Reservation");
        }

        Rating createdRating = ratingMapper.toEntity(dto);
        Rating savedRating = ratingRepository.save(createdRating);

        return ratingMapper.toResponse(savedRating);

    }

    public RatingResponse updateRating(UpdateRatingRequest dto, UUID id){

        Rating rating = ratingRepository.findById(id).orElseThrow(
                () -> new RatingNotFoundException("Rating does not exist"));

        ratingMapper.updateEntity(dto, rating);
        Rating updatedRating = ratingRepository.save(rating);

        return ratingMapper.toResponse(updatedRating);

    }

    public void deleteRating(UUID id){

        if(!ratingRepository.existsById(id)){
            throw new RatingNotFoundException("Rating does not exist");
        }
        ratingRepository.deleteById(id);

    }

}
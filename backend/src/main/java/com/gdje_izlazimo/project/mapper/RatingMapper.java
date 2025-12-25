package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.entity.Rating;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import com.gdje_izlazimo.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RatingMapper {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public RatingMapper(ReservationRepository reservationRepository, UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    public Rating toEntity(CreateRatingRequest dto){
        Rating createdEntity = new Rating();
        createdEntity.setRating(dto.rating());
        createdEntity.setComment(dto.comment());

        Reservation reservation_id = reservationRepository.findById(dto.reservationId()).orElseThrow(
                () -> new RuntimeException("Reservation not found"));

        createdEntity.setReservationId(reservation_id);

        User user_id = userRepository.findById(dto.userId()).orElseThrow(
                () -> new RuntimeException("User not found"));

        createdEntity.setUserId(user_id);

        return createdEntity;
    }

    public void updateEntity(UpdateRatingRequest dto, Rating entity){
        entity.setRating(dto.rating());
        entity.setComment(dto.comment());
    }

    public RatingResponse toResponse(Rating entity){
        return new RatingResponse(
                entity.getId(),
                entity.getReservationId().getId(),
                entity.getUserId().getId(),
                entity.getRating(),
                entity.getComment(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }

}
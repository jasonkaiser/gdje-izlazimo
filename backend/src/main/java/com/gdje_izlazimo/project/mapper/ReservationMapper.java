package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.repository.UserRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ReservationMapper  {

    private final VenueRepository venueRepository;
    private final UserRepository userRepository;

    @Autowired
    public ReservationMapper(VenueRepository venueRepository, UserRepository userRepository) {
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
    }

    public Reservation toEntity(CreateReservationRequest dto){
            Reservation createdEntity = new Reservation();
            createdEntity.setPhone(dto.phone());
            createdEntity.setReservationDate(dto.reservationDate());
            createdEntity.setReservationTime(dto.reservationTime());
            createdEntity.setStatus(dto.status());
            createdEntity.setTableType(dto.tableType());
            createdEntity.setSpecialRequests(dto.specialRequests());

            User user_id = userRepository.findById(dto.userId()).orElseThrow(
                    () -> new RuntimeException("User not found"));

            createdEntity.setUserId(user_id);

            Venue venue_id = venueRepository.findById(dto.venueId()).orElseThrow(
                    () -> new RuntimeException("Venue not found"));
            createdEntity.setVenueId(venue_id);

            return createdEntity;
    }

    public void updateEntity(UpdateReservationRequest dto, Reservation entity){
        entity.setStatus(dto.status());


    }

    public ReservationResponse toResponse(Reservation entity){
        return new ReservationResponse(
                entity.getId(),
                entity.getUserId().getId(),
                entity.getVenueId().getId(),
                entity.getPhone(),
                entity.getReservationDate(),
                entity.getReservationTime(),
                entity.getNumberOfPeople(),
                entity.getTableType(),
                entity.getStatus(),
                entity.getSpecialRequests(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );

    }

}

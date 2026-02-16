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

    public ReservationMapper(VenueRepository venueRepository, UserRepository userRepository) {
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
    }

    public Reservation toEntity(CreateReservationRequest dto){
        Reservation createdEntity = new Reservation();
        createdEntity.setPhone(dto.phone());
        createdEntity.setReservationDate(dto.reservationDate());
        createdEntity.setReservationTime(dto.reservationTime());
        createdEntity.setSpecialRequests(dto.specialRequests());
        createdEntity.setNumberOfPeople(dto.numberOfPeople());

        Venue venue_id = venueRepository.findById(dto.venueId()).orElseThrow(
                () -> new RuntimeException("Venue not found"));
        createdEntity.setVenueId(venue_id);

        return createdEntity;
    }

    public void updateEntity(UpdateReservationRequest dto, Reservation entity){
        entity.setStatus(dto.status());
    }

    public ReservationResponse toResponse(Reservation entity){

        var venue = entity.getVenueId();
        var tableType = entity.getTableType();

        return new ReservationResponse(
                entity.getId(),
                entity.getUserId().getId(),
                venue.getId(),
                entity.getPhone(),
                venue.getName(),
                venue.getAddressName(),
                entity.getReservationDate(),
                entity.getReservationTime(),
                entity.getNumberOfPeople(),
                tableType != null ? tableType.getId() : null,
                entity.getStatus(),
                entity.getSpecialRequests(),
                entity.getRejectReason(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }
}
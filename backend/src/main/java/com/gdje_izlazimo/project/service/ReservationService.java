package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.mapper.ReservationMapper;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;

    public ReservationService(ReservationRepository reservationRepository, ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
    }

    public List<ReservationResponse> findAllReservations(){

        List<Reservation> responses = reservationRepository.findAll();

        return responses.stream()
                .map(reservationMapper::toResponse)
                .toList();

    }

    public ReservationResponse findReservationById(UUID id){

        Reservation response = reservationRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation does not exist"));

        return reservationMapper.toResponse(response);

    }

    public ReservationResponse createReservation(CreateReservationRequest dto){

        if (reservationRepository.existsByUserId_IdAndVenueId_Id(dto.userId(), dto.venueId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a Reservation in this Venue");
        }

        Reservation createdReservation = reservationMapper.toEntity(dto);
        Reservation savedReservation = reservationRepository.save(createdReservation);

        return reservationMapper.toResponse(savedReservation);

    }

    public ReservationResponse updateReservation(UpdateReservationRequest dto, UUID id){

        Reservation reservation = reservationRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation does not exist"));

        reservationMapper.updateEntity(dto, reservation);
        Reservation updatedReservation = reservationRepository.save(reservation);

        return reservationMapper.toResponse(updatedReservation);

    }

    public void deleteReservation(UUID id){

        if(!reservationRepository.existsById(id)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation does not exist");
        }
        reservationRepository.deleteById(id);

    };


}

package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.exception.custom.ReservationAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.ReservationNotFoundException;
import com.gdje_izlazimo.project.mapper.ReservationMapper;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    public List<ReservationResponse> findAllReservations(Pageable pageable){

        List<Reservation> responses = reservationRepository.findAll(pageable).getContent();

        return responses.stream()
                .map(reservationMapper::toResponse)
                .toList();

    }

    public ReservationResponse findReservationById(UUID id){

        Reservation response = reservationRepository.findById(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist"));

        return reservationMapper.toResponse(response);

    }

    public List<ReservationResponse> findReservationsByVenueId(UUID venueId, Pageable pageable) {
        List<Reservation> reservations = reservationRepository.findByVenueId_Id(venueId, pageable).getContent();

        return reservations.stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    public List<ReservationResponse> findReservationsByUserId(UUID userId, Pageable pageable) {
        List<Reservation> reservations = reservationRepository.findByUserId_Id(userId, pageable).getContent();

        return reservations.stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    public ReservationResponse createReservation(CreateReservationRequest dto){

        if (reservationRepository.existsByUserId_IdAndVenueId_IdAndReservationDate(
                dto.userId(),
                dto.venueId(),
                dto.reservationDate())) {
            throw new ReservationAlreadyExistsException("You already have a reservation at this venue for this date");
        }

        Reservation createdReservation = reservationMapper.toEntity(dto);
        Reservation savedReservation = reservationRepository.save(createdReservation);

        return reservationMapper.toResponse(savedReservation);

    }

    public ReservationResponse updateReservation(UpdateReservationRequest dto, UUID id){

        Reservation reservation = reservationRepository.findById(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist"));

        reservationMapper.updateEntity(dto, reservation);
        Reservation updatedReservation = reservationRepository.save(reservation);

        return reservationMapper.toResponse(updatedReservation);

    }

    public void deleteReservation(UUID id){

        if(!reservationRepository.existsById(id)){
            throw new ReservationNotFoundException("Reservation does not exist");
        }
        reservationRepository.deleteById(id);

    }

}
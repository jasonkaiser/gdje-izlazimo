package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.enums.Status;
import com.gdje_izlazimo.project.exception.custom.*;
import com.gdje_izlazimo.project.mapper.ReservationMapper;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import com.gdje_izlazimo.project.repository.TableTypeRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.nio.file.AccessDeniedException;
import java.util.List;
import java.util.UUID;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final UserService userService;
    private final TableTypeService tableTypeService;
    private final TableTypeRepository tableTypeRepository;
    private final VenueService venueService;

    public ReservationService(ReservationRepository reservationRepository, ReservationMapper reservationMapper, UserService userService, TableTypeService tableTypeService, TableTypeRepository tableTypeRepository, VenueService venueService) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
        this.userService = userService;
        this.tableTypeService = tableTypeService;
        this.tableTypeRepository = tableTypeRepository;
        this.venueService = venueService;
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

    public ReservationResponse createReservation(CreateReservationRequest dto, String keycloakSub){

        UUID userId = UUID.fromString(keycloakSub);
        TableType table = tableTypeService.findEntityById(dto.tableTypeId());
        User user = userService.getOrCreate(userId);

        if (reservationRepository.existsByUserId_IdAndVenueId_IdAndReservationDate(
                user.getId(),
                dto.venueId(),
                dto.reservationDate())) {
            throw new ReservationAlreadyExistsException("You already have a reservation at this venue for this date");
        }

        Reservation createdReservation = reservationMapper.toEntity(dto);

        createdReservation.setUserId(user);
        createdReservation.setTableType(table);
        createdReservation.setStatus(Status.PENDING);

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

    public ReservationResponse acceptReservation(UUID id, String keycloakSub) {

        Reservation reservation = reservationRepository.findById(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );

        if (reservation.getStatus() != Status.PENDING) {
            throw new InvalidReservationStatusException("Only PENDING reservations can be accepted");
        }

        UUID actorId = UUID.fromString(keycloakSub);
        User actor = userService.getOrCreate(actorId);

        if (actor.getRole() != Role.ADMIN) {
            if (actor.getRole() != Role.VENUE_OWNER) {
                throw new InvalidRoleException("You are not allowed to accept reservations");
            }

            UUID ownerId = reservation.getVenueId().getVenueOwner().getId();
            if (!ownerId.equals(actor.getId())) {
                throw new ReservationAccessDeniedException("This reservation is not for your venue");
            }
        }

        reservation.setStatus(Status.ACCEPTED);

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toResponse(saved);
    }


    public ReservationResponse rejectReservation(UUID id, String keycloakSub) {

        Reservation reservation = reservationRepository.findById(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );

        if (reservation.getStatus() != Status.PENDING) {
            throw new InvalidReservationStatusException("Only PENDING reservations can be rejected");
        }

        UUID actorId = UUID.fromString(keycloakSub);
        User actor = userService.getOrCreate(actorId);

        if (actor.getRole() != Role.ADMIN) {
            if (actor.getRole() != Role.VENUE_OWNER) {
                throw new InvalidRoleException("You are not allowed to reject reservations");
            }

            UUID ownerId = reservation.getVenueId().getVenueOwner().getId();
            if (!ownerId.equals(actor.getId())) {
                throw new ReservationAccessDeniedException("This reservation is not for your venue");
            }
        }

        reservation.setStatus(Status.REJECTED);

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toResponse(saved);
    }

    public ReservationResponse cancelReservation(UUID id, String keycloakSub) {

        Reservation reservation = reservationRepository.findById(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );

        if (reservation.getStatus() != Status.PENDING) {
            throw new InvalidReservationStatusException("Only PENDING reservations can be cancelled");
            // later for the status.accepted version
            // if (reservation.getStatus() != Status.PENDING && reservation.getStatus() != Status.ACCEPTED) ...
        }

        UUID actorId = UUID.fromString(keycloakSub);
        User actor = userService.getOrCreate(actorId);

        if (actor.getRole() != Role.ADMIN) {
            UUID reservationUserId = reservation.getUserId().getId();
            if (!reservationUserId.equals(actor.getId())) {
                throw new ReservationAccessDeniedException("You can only cancel your own reservation");
            }
        }

        reservation.setStatus(Status.CANCELLED);

        Reservation saved = reservationRepository.save(reservation);
        return reservationMapper.toResponse(saved);
    }


    public void deleteReservation(UUID id){

        if(!reservationRepository.existsById(id)){
            throw new ReservationNotFoundException("Reservation does not exist");
        }
        reservationRepository.deleteById(id);

    }

}
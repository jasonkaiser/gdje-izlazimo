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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final UserService userService;
    private final TableTypeService tableTypeService;
    private final TableTypeRepository tableTypeRepository;
    private final EmailService emailService;
    private final VenueService venueService;

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    public ReservationService(
            ReservationRepository reservationRepository,
            ReservationMapper reservationMapper,
            UserService userService,
            TableTypeService tableTypeService,
            TableTypeRepository tableTypeRepository,
            VenueService venueService,
            EmailService emailService
    ) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
        this.userService = userService;
        this.tableTypeService = tableTypeService;
        this.tableTypeRepository = tableTypeRepository;
        this.venueService = venueService;
        this.emailService = emailService;
    }

    public List<ReservationResponse> findAllReservations(Pageable pageable) {
        List<Reservation> responses = reservationRepository.findAll(pageable).getContent();
        return responses.stream().map(reservationMapper::toResponse).toList();
    }

    public ReservationResponse findReservationById(UUID id) {
        Reservation response = reservationRepository.findByIdWithDetails(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );
        return reservationMapper.toResponse(response);
    }

    public List<ReservationResponse> findReservationsByVenueId(UUID venueId, Pageable pageable) {
        List<Reservation> reservations = reservationRepository.findByVenueIdWithDetails(venueId, pageable).getContent();
        return reservations.stream().map(reservationMapper::toResponse).toList();
    }

    public List<ReservationResponse> findReservationsByUserId(UUID userId, Pageable pageable) {
        return reservationRepository.findResponsesByUserId(userId, pageable).getContent();
    }

    @Transactional
    public ReservationResponse createReservation(CreateReservationRequest dto, String keycloakSub, String requesterEmail) {
        LocalDateTime requested = LocalDateTime.of(dto.reservationDate(), dto.reservationTime());
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Europe/Sarajevo"));

        if (requested.isBefore(now)) {
            throw new InvalidReservationDateException("Reservation date/time cannot be in the past");
        }

        UUID userId = UUID.fromString(keycloakSub);
        TableType table = tableTypeService.findEntityById(dto.tableTypeId());

        User user = userService.getOrCreate(userId, requesterEmail);

        if (reservationRepository.existsByUserId_IdAndVenueId_IdAndReservationDateAndReservationTime(
                user.getId(),
                dto.venueId(),
                dto.reservationDate(),
                dto.reservationTime()
        )) {
            throw new ReservationAlreadyExistsException("You already have a reservation at this venue for this date/time");
        }

        Reservation createdReservation = reservationMapper.toEntity(dto);
        createdReservation.setUserId(user);
        createdReservation.setTableType(table);
        createdReservation.setStatus(Status.PENDING);

        Reservation savedReservation = reservationRepository.save(createdReservation);

        try {
            String to = requesterEmail;
            if (to != null && !to.isBlank()) {
                emailService.sendPlainText(
                        to,
                        "GDJE IZLAZIMO | Rezervacija zaprimljena (PENDING)",
                        "Primili smo tvoju rezervaciju za " + savedReservation.getReservationDate()
                                + " u " + savedReservation.getReservationTime() + ". Status: PENDING."
                );
            } else {
                log.warn("Skipping CREATED email: requesterEmail is null/blank. reservationId={}", savedReservation.getId());
            }
        } catch (Exception e) {
            log.warn("Failed to send reservation CREATED email for reservation {}", savedReservation.getId(), e);
        }

        return reservationMapper.toResponse(savedReservation);
    }

    @Transactional
    public ReservationResponse updateReservation(UpdateReservationRequest dto, UUID id) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );
        reservationMapper.updateEntity(dto, reservation);
        Reservation updatedReservation = reservationRepository.save(reservation);
        return reservationMapper.toResponse(updatedReservation);
    }

    @Transactional
    public void acceptReservation(UUID id, String keycloakSub) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
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
        reservation.setRejectReason(null);
        reservationRepository.save(reservation);

        try {
            String to = reservation.getUserId() != null ? reservation.getUserId().getEmail() : null;
            if (to != null && !to.isBlank()) {
                emailService.sendPlainText(
                        to,
                        "GDJE IZLAZIMO | Rezervacija prihvacena (ACCEPTED)",
                        "Prihvatili smo tvoju rezervaciju za " + reservation.getReservationDate()
                                + " u " + reservation.getReservationTime() + ". Status: ACCEPTED."
                );
            } else {
                log.warn("Skipping ACCEPTED email: reservation user email is null/blank. reservationId={}", reservation.getId());
            }
        } catch (Exception e) {
            log.warn("Failed to send reservation ACCEPTED email for reservation {}", reservation.getId(), e);
        }
    }

    @Transactional
    public void rejectReservation(UUID id, String keycloakSub, String reason) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
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
        reservation.setRejectReason(reason != null ? reason.trim() : null);
        reservationRepository.save(reservation);

        try {
            String to = reservation.getUserId() != null ? reservation.getUserId().getEmail() : null;
            if (to != null && !to.isBlank()) {
                String msg = "Odbili smo tvoju rezervaciju za " + reservation.getReservationDate()
                        + " u " + reservation.getReservationTime() + ". Status: REJECTED."
                        + (reservation.getRejectReason() != null && !reservation.getRejectReason().isBlank()
                        ? "\nRazlog: " + reservation.getRejectReason()
                        : "");

                emailService.sendPlainText(
                        to,
                        "GDJE IZLAZIMO | Rezervacija odbijena (REJECTED)",
                        msg
                );
            } else {
                log.warn("Skipping REJECTED email: reservation user email is null/blank. reservationId={}", reservation.getId());
            }
        } catch (Exception e) {
            log.warn("Failed to send reservation REJECTED email for reservation {}", reservation.getId(), e);
        }
    }


    @Transactional
    public void cancelReservation(UUID id, String keycloakSub, String requesterEmail) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );

        if (reservation.getStatus() != Status.PENDING && reservation.getStatus() != Status.ACCEPTED) {
            throw new InvalidReservationStatusException("Only PENDING / ACCEPTED reservations can be cancelled");
        }

        if (reservation.getStatus() == Status.ACCEPTED) {
            LocalDateTime reservationStart = LocalDateTime.of(reservation.getReservationDate(), reservation.getReservationTime());
            LocalDateTime cancelDeadline = reservationStart.minusHours(2);
            LocalDateTime now = LocalDateTime.now(ZoneId.of("Europe/Sarajevo"));

            if (now.isAfter(cancelDeadline)) {
                throw new InvalidReservationDateException("Reservation can be cancelled up to 2 hours before the start time");
            }
        }

        UUID actorId = UUID.fromString(keycloakSub);

        User actor = userService.getOrCreate(actorId, requesterEmail);

        boolean actorIsReservationOwner =
                reservation.getUserId() != null && reservation.getUserId().getId().equals(actor.getId());

        if (actor.getRole() != Role.ADMIN && !actorIsReservationOwner) {
            throw new ReservationAccessDeniedException("You can only cancel your own reservation");
        }

        reservation.setStatus(Status.CANCELLED);
        reservationRepository.save(reservation);

        try {
            String to;

            if (actorIsReservationOwner) {
                to = requesterEmail;
            } else {
                to = reservation.getUserId() != null ? reservation.getUserId().getEmail() : null; // cached earlier
            }

            if (to != null && !to.isBlank()) {
                emailService.sendPlainText(
                        to,
                        "GDJE IZLAZIMO | Rezervacija otkazana (CANCELLED)",
                        "Otkazana je tvoja rezervacija za " + reservation.getReservationDate()
                                + " u " + reservation.getReservationTime() + ". Status: CANCELLED."
                );
            } else {
                log.warn("Skipping CANCELLED email: recipient is null/blank. reservationId={}", reservation.getId());
            }
        } catch (Exception e) {
            log.warn("Failed to send reservation CANCELLED email for reservation {}", reservation.getId(), e);
        }
    }

    @Transactional
    public void deleteReservation(UUID id) {
        if (!reservationRepository.existsById(id)) {
            throw new ReservationNotFoundException("Reservation does not exist");
        }
        reservationRepository.deleteById(id);
    }
}

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
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
    private final EmailService emailService;

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    public ReservationService(
            ReservationRepository reservationRepository,
            ReservationMapper reservationMapper,
            UserService userService,
            TableTypeService tableTypeService,
            EmailService emailService
    ) {
        this.reservationRepository = reservationRepository;
        this.reservationMapper = reservationMapper;
        this.userService = userService;
        this.tableTypeService = tableTypeService;
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
        List<Reservation> reservations = reservationRepository.findByVenue_IdWithDetails(venueId, pageable).getContent();
        return reservations.stream().map(reservationMapper::toResponse).toList();
    }

    public List<ReservationResponse> findReservationsByUserId(UUID userId, Pageable pageable) {
        return reservationRepository.findResponsesByUserId(userId, pageable).getContent();
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "reservationStatusBreakdown", "topVenues"}, allEntries = true)
    public ReservationResponse createReservation(CreateReservationRequest dto, String keycloakSub, String requesterEmail, String username) {
        LocalDateTime requested = LocalDateTime.of(dto.reservationDate(), dto.reservationTime());
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Europe/Sarajevo"));

        if (requested.isBefore(now)) {
            throw new InvalidReservationDateException("Reservation date/time cannot be in the past");
        }

        UUID userId = UUID.fromString(keycloakSub);
        TableType table = tableTypeService.findEntityById(dto.tableTypeId());

        User user = userService.getOrCreate(userId, requesterEmail, username);

        if (reservationRepository.existsByUser_IdAndVenue_IdAndReservationDateAndReservationTime(
                user.getId(),
                dto.venueId(),
                dto.reservationDate(),
                dto.reservationTime()
        )) {
            throw new ReservationAlreadyExistsException("You already have a reservation at this venue for this date/time");
        }

        Reservation createdReservation = reservationMapper.toEntity(dto);
        createdReservation.setUser(user);
        createdReservation.setTableType(table);
        createdReservation.setStatus(Status.PENDING);
        Reservation savedReservation = reservationRepository.save(createdReservation);

        sendReservationEmail(
                requesterEmail,
                "GDJE IZLAZIMO | Rezervacija primljena (NA CEKANJU)",
                "Primili smo vasu rezervaciju za " + savedReservation.getReservationDate()
                        + " u " + savedReservation.getReservationTime() + ". Status: NA CEKANJU.",
                savedReservation.getId()
        );

        return reservationMapper.toResponse(savedReservation);
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "reservationStatusBreakdown", "topVenues"}, allEntries = true)
    public ReservationResponse updateReservation(UpdateReservationRequest dto, UUID id) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );
        reservationMapper.updateEntity(dto, reservation);
        Reservation updatedReservation = reservationRepository.save(reservation);
        return reservationMapper.toResponse(updatedReservation);
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "reservationStatusBreakdown", "topVenues"}, allEntries = true)
    public void acceptReservation(UUID id, String keycloakSub) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );

        if (reservation.getStatus() != Status.PENDING) {
            throw new InvalidReservationStatusException("Only PENDING reservations can be accepted");
        }

        UUID actorId = UUID.fromString(keycloakSub);
        User actor = userService.getOrCreate(actorId, null, null);

        if (actor.getRole() != Role.ADMIN) {
            if (actor.getRole() != Role.VENUE_OWNER) {
                throw new InvalidRoleException("You are not allowed to accept reservations");
            }
            UUID ownerId = reservation.getVenue().getVenueOwner().getId();
            if (!ownerId.equals(actor.getId())) {
                throw new ReservationAccessDeniedException("This reservation is not for your venue");
            }
        }

        reservation.setStatus(Status.ACCEPTED);
        reservation.setRejectReason(null);
        String requesterEmail = reservation.getUser().getEmail();
        Reservation savedReservation = reservationRepository.save(reservation);

        sendReservationEmail(
                requesterEmail,
                "GDJE IZLAZIMO | Rezervacija prihvacena (PRIHVACENO)",
                "Prihvatili smo vasu rezervaciju za " + savedReservation.getReservationDate()
                        + " u " + savedReservation.getReservationTime() + ". Status: PRIHVACENO.",
                savedReservation.getId()
        );
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "reservationStatusBreakdown", "topVenues"}, allEntries = true)
    public void rejectReservation(UUID id, String keycloakSub, String reason) {
        Reservation reservation = reservationRepository.findByIdWithDetails(id).orElseThrow(
                () -> new ReservationNotFoundException("Reservation does not exist")
        );

        if (reservation.getStatus() != Status.PENDING) {
            throw new InvalidReservationStatusException("Only PENDING reservations can be rejected");
        }

        UUID actorId = UUID.fromString(keycloakSub);
        User actor = userService.getOrCreate(actorId, null, null);


        if (actor.getRole() != Role.ADMIN) {
            if (actor.getRole() != Role.VENUE_OWNER) {
                throw new InvalidRoleException("You are not allowed to reject reservations");
            }
            UUID ownerId = reservation.getVenue().getVenueOwner().getId();
            if (!ownerId.equals(actor.getId())) {
                throw new ReservationAccessDeniedException("This reservation is not for your venue");
            }
        }

        reservation.setStatus(Status.REJECTED);
        reservation.setRejectReason(reason != null ? reason.trim() : null);
        String requesterEmail = reservation.getUser().getEmail();
        Reservation savedReservation = reservationRepository.save(reservation);

        sendReservationEmail(
                requesterEmail,
                "GDJE IZLAZIMO | Rezervacija odbijena (ODBIJENO)",
                "Odbili smo vasu rezervaciju za " + savedReservation.getReservationDate()
                        + " u " + savedReservation.getReservationTime() + ". Status: ODBIJENO.",
                savedReservation.getId()
        );
    }


    @Transactional
    @CacheEvict(value = {"dashboardStats", "reservationStatusBreakdown", "topVenues"}, allEntries = true)
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

        User actor = userService.getOrCreate(actorId, requesterEmail, null);
        boolean actorIsReservationOwner =
                reservation.getUser() != null && reservation.getUser().getId().equals(actor.getId());

        if (actor.getRole() != Role.ADMIN && !actorIsReservationOwner) {
            throw new ReservationAccessDeniedException("You can only cancel your own reservation");
        }

        reservation.setStatus(Status.CANCELLED);
        Reservation savedReservation = reservationRepository.save(reservation);

        sendReservationEmail(
                requesterEmail,
                "GDJE IZLAZIMO | Rezervacija otkazana (OTKAZANO)",
                "Otkazani smo vasu rezervaciju za " + savedReservation.getReservationDate()
                        + " u " + savedReservation.getReservationTime() + ". Status: OTKAZANO.",
                savedReservation.getId()
        );
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "reservationStatusBreakdown", "topVenues"}, allEntries = true)
    public void deleteReservation(UUID id) {
        if (!reservationRepository.existsById(id)) {
            throw new ReservationNotFoundException("Reservation does not exist");
        }
        reservationRepository.deleteById(id);
    }

    private void sendReservationEmail(String to, String subject, String body, UUID reservationId) {
        try {
            if (to != null && !to.isBlank()) {
                emailService.sendPlainText(to, subject, body);
            } else {
                log.warn("Skipping email: recipient is null/blank. reservationId={}", reservationId);
            }
        } catch (Exception e) {
            log.warn("Failed to send email for reservation {}", reservationId, e);
        }
    }
}

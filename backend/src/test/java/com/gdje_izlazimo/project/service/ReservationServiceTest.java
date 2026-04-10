package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.enums.Status;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.exception.custom.InvalidReservationDateException;
import com.gdje_izlazimo.project.exception.custom.InvalidReservationStatusException;
import com.gdje_izlazimo.project.exception.custom.ReservationAccessDeniedException;
import com.gdje_izlazimo.project.exception.custom.ReservationAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.ReservationNotFoundException;
import com.gdje_izlazimo.project.mapper.ReservationMapper;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ReservationMapper reservationMapper;

    @Mock
    private UserService userService;

    @Mock
    private TableTypeService tableTypeService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ReservationService reservationService;

    private User user;
    private Venue venue;
    private TableType tableType;
    private Reservation reservation;
    private UUID userId;
    private UUID venueId;
    private UUID reservationId;
    private UUID tableTypeId;

    @BeforeEach
    void setUp() {
        userId        = UUID.randomUUID();
        venueId       = UUID.randomUUID();
        reservationId = UUID.randomUUID();
        tableTypeId   = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("user@test.com");
        user.setName("Test User");
        user.setRole(Role.USER);

        User owner = new User();
        owner.setId(UUID.randomUUID());
        owner.setRole(Role.VENUE_OWNER);

        venue = new Venue();
        venue.setId(venueId);
        venue.setName("Test Venue");
        venue.setAddressName("Test Address");
        venue.setVenueType(VenueCategory.LOUNGE);
        venue.setActive(true);
        venue.setVenueOwner(owner);

        tableType = new TableType();
        tableType.setId(tableTypeId);
        tableType.setName("VIP");

        reservation = new Reservation();
        reservation.setId(reservationId);
        reservation.setUser(user);
        reservation.setVenue(venue);
        reservation.setTableType(tableType);
        reservation.setReservationDate(LocalDate.now().plusDays(1));
        reservation.setReservationTime(LocalTime.of(20, 0));
        reservation.setNumberOfPeople(4);
        reservation.setPhone("+38761000000");
        reservation.setStatus(Status.PENDING);
    }


    @Test
    void shouldReturnReservationById() {
        ReservationResponse expectedResponse = new ReservationResponse(
                reservationId, userId, venueId, "+38761000000",
                "Test Venue", "Test Address",
                LocalDate.now().plusDays(1), LocalTime.of(20, 0),
                4, tableTypeId, Status.PENDING, null, null,
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));
        when(reservationMapper.toResponse(reservation))
                .thenReturn(expectedResponse);

        ReservationResponse result = reservationService.findReservationById(reservationId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(reservationId);
        assertThat(result.status()).isEqualTo(Status.PENDING);
        assertThat(result.venueName()).isEqualTo("Test Venue");
    }

    @Test
    void shouldThrowWhenReservationNotFoundById() {
        UUID unknownId = UUID.randomUUID();
        when(reservationRepository.findByIdWithDetails(unknownId))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> reservationService.findReservationById(unknownId))
                .isInstanceOf(ReservationNotFoundException.class)
                .hasMessageContaining("Reservation does not exist");
    }



    @Test
    void shouldDenyAccessWhenRequesterIsNotOwnerAndNotAdmin() {
        UUID differentUserId = UUID.randomUUID();

        assertThatThrownBy(() ->
                reservationService.findReservationsByUserId(userId, differentUserId, null, null))
                .isInstanceOf(ReservationAccessDeniedException.class)
                .hasMessageContaining("your own reservations");
    }

    @Test
    void shouldCreateReservationSuccessfully() {
        CreateReservationRequest dto = new CreateReservationRequest(
                venueId, "+38761000000",
                LocalDate.now().plusDays(1),
                LocalTime.of(20, 0),
                tableTypeId, 4, null
        );

        ReservationResponse expectedResponse = new ReservationResponse(
                reservationId, userId, venueId, "+38761000000",
                "Test Venue", "Test Address",
                LocalDate.now().plusDays(1), LocalTime.of(20, 0),
                4, tableTypeId, Status.PENDING, null, null,
                LocalDateTime.now(), LocalDateTime.now()
        );

        when(tableTypeService.findEntityById(tableTypeId)).thenReturn(tableType);
        when(userService.getOrCreate(eq(userId), anyString(), anyString(), anyString()))
                .thenReturn(user);
        when(reservationRepository
                .existsByUser_IdAndVenue_IdAndReservationDateAndReservationTime(
                        any(), any(), any(), any()))
                .thenReturn(false);
        when(reservationMapper.toEntity(dto)).thenReturn(reservation);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);
        when(reservationMapper.toResponse(reservation)).thenReturn(expectedResponse);

        ReservationResponse result = reservationService.createReservation(
                dto, userId.toString(), "user@test.com", "Test User", "+38761000000"
        );

        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo(Status.PENDING);
        verify(emailService, times(1)).sendPlainText(
                eq("user@test.com"), anyString(), anyString()
        );
    }

    @Test
    void shouldThrowWhenReservationDateIsInThePast() {
        CreateReservationRequest dto = new CreateReservationRequest(
                venueId, "+38761000000",
                LocalDate.now().minusDays(1),
                LocalTime.of(10, 0),
                tableTypeId, 2, null
        );

        assertThatThrownBy(() ->
                reservationService.createReservation(
                        dto, userId.toString(), "user@test.com", "Test User", "+38761000000"))
                .isInstanceOf(InvalidReservationDateException.class)
                .hasMessageContaining("cannot be in the past");
    }

    @Test
    void shouldThrowWhenDuplicateReservationExists() {
        CreateReservationRequest dto = new CreateReservationRequest(
                venueId, "+38761000000",
                LocalDate.now().plusDays(1),
                LocalTime.of(20, 0),
                tableTypeId, 4, null
        );

        when(tableTypeService.findEntityById(tableTypeId)).thenReturn(tableType);
        when(userService.getOrCreate(eq(userId), anyString(), anyString(), anyString()))
                .thenReturn(user);
        when(reservationRepository
                .existsByUser_IdAndVenue_IdAndReservationDateAndReservationTime(
                        any(), any(), any(), any()))
                .thenReturn(true);

        assertThatThrownBy(() ->
                reservationService.createReservation(
                        dto, userId.toString(), "user@test.com", "Test User", "+38761000000"))
                .isInstanceOf(ReservationAlreadyExistsException.class)
                .hasMessageContaining("already have a reservation");
    }


    @Test
    void shouldAcceptReservationAsAdmin() {
        UUID adminId = UUID.randomUUID();
        User admin = new User();
        admin.setId(adminId);
        admin.setRole(Role.ADMIN);

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));
        when(userService.getOrCreate(eq(adminId), any(), any(), any()))
                .thenReturn(admin);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        reservationService.acceptReservation(reservationId, adminId.toString());

        assertThat(reservation.getStatus()).isEqualTo(Status.ACCEPTED);
        verify(emailService, times(1)).sendPlainText(anyString(), anyString(), anyString());
    }

    @Test
    void shouldThrowWhenAcceptingNonPendingReservation() {
        reservation.setStatus(Status.ACCEPTED);

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));

        assertThatThrownBy(() ->
                reservationService.acceptReservation(reservationId, userId.toString()))
                .isInstanceOf(InvalidReservationStatusException.class)
                .hasMessageContaining("Only PENDING reservations can be accepted");
    }


    @Test
    void shouldRejectReservationAsAdmin() {
        UUID adminId = UUID.randomUUID();
        User admin = new User();
        admin.setId(adminId);
        admin.setRole(Role.ADMIN);

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));
        when(userService.getOrCreate(eq(adminId), any(), any(), any()))
                .thenReturn(admin);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        reservationService.rejectReservation(reservationId, adminId.toString(), "Fully booked");

        assertThat(reservation.getStatus()).isEqualTo(Status.REJECTED);
        assertThat(reservation.getRejectReason()).isEqualTo("Fully booked");
        verify(emailService, times(1)).sendPlainText(anyString(), anyString(), anyString());
    }

    @Test
    void shouldThrowWhenRejectingNonPendingReservation() {
        reservation.setStatus(Status.REJECTED);

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));

        assertThatThrownBy(() ->
                reservationService.rejectReservation(reservationId, userId.toString(), "reason"))
                .isInstanceOf(InvalidReservationStatusException.class)
                .hasMessageContaining("Only PENDING reservations can be rejected");
    }


    @Test
    void shouldCancelPendingReservationByOwner() {
        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));
        when(userService.getOrCreate(eq(userId), anyString(), any(), any()))
                .thenReturn(user);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(reservation);

        reservationService.cancelReservation(
                reservationId, userId.toString(), "user@test.com"
        );

        assertThat(reservation.getStatus()).isEqualTo(Status.CANCELLED);
        verify(emailService, times(1)).sendPlainText(anyString(), anyString(), anyString());
    }

    @Test
    void shouldThrowWhenCancellingAlreadyCancelledReservation() {
        reservation.setStatus(Status.CANCELLED);

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));

        assertThatThrownBy(() ->
                reservationService.cancelReservation(
                        reservationId, userId.toString(), "user@test.com"))
                .isInstanceOf(InvalidReservationStatusException.class)
                .hasMessageContaining("Only PENDING / ACCEPTED reservations can be cancelled");
    }

    @Test
    void shouldThrowWhenCancellingAcceptedReservationWithin2Hours() {
        reservation.setStatus(Status.ACCEPTED);
        reservation.setReservationDate(LocalDate.now());
        reservation.setReservationTime(LocalTime.now().plusHours(1));

        when(reservationRepository.findByIdWithDetails(reservationId))
                .thenReturn(Optional.of(reservation));

        assertThatThrownBy(() ->
                reservationService.cancelReservation(
                        reservationId, userId.toString(), "user@test.com"))
                .isInstanceOf(InvalidReservationDateException.class)
                .hasMessageContaining("2 hours before the start time");
    }



    @Test
    void shouldDeleteReservationSuccessfully() {
        when(reservationRepository.existsById(reservationId)).thenReturn(true);

        reservationService.deleteReservation(reservationId);

        verify(reservationRepository, times(1)).deleteById(reservationId);
    }

    @Test
    void shouldThrowWhenDeletingNonExistentReservation() {
        UUID unknownId = UUID.randomUUID();
        when(reservationRepository.existsById(unknownId)).thenReturn(false);

        assertThatThrownBy(() -> reservationService.deleteReservation(unknownId))
                .isInstanceOf(ReservationNotFoundException.class)
                .hasMessageContaining("Reservation does not exist");
    }
}
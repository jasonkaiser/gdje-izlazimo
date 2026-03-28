package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRejectReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reservations")
@Tag(name = "Reservations", description = "Reservation management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Operation(summary = "Get my reservations", description = "Returns paginated list of reservations for the currently authenticated user. Requires role: user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservations retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('user')")
    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponse>> findMyReservations(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<String> roles = jwt.getClaimAsStringList("roles");
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(reservationService.findReservationsByUserId(userId, userId, roles, pageable));
    }

    @Operation(summary = "Get all reservations", description = "Returns paginated list of all reservations. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservations retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('admin')")
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> findAllReservations(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(reservationService.findAllReservations(pageable));
    }

    @Operation(summary = "Get reservation by ID", description = "Returns a single reservation by its UUID. Requires role: user, venue_owner, or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservation found"),
            @ApiResponse(responseCode = "404", description = "Reservation not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> findReservationById(
            @Parameter(description = "Reservation UUID") @PathVariable UUID id
    ) {
        return ResponseEntity.ok(reservationService.findReservationById(id));
    }

    @Operation(summary = "Get reservations by venue", description = "Returns paginated reservations for a specific venue. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservations retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<ReservationResponse>> findReservationsByVenue(
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(reservationService.findReservationsByVenueId(venueId, pageable));
    }

    @Operation(summary = "Get reservations by user", description = "Returns paginated reservations for a specific user. Requires role: user, venue_owner, or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservations retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @PreAuthorize("hasAnyRole('user','venue_owner','admin')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponse>> findReservationsByUser(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "User UUID") @PathVariable UUID userId,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        UUID requesterId = UUID.fromString(jwt.getSubject());
        List<String> roles = jwt.getClaimAsStringList("roles");
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(reservationService.findReservationsByUserId(userId, requesterId, roles, pageable));
    }

    @Operation(summary = "Create a reservation", description = "Creates a new reservation for the authenticated user. Requires role: user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservation created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('user')")
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateReservationRequest entity
    ) {
        String email = jwt.getClaimAsString("email");
        return ResponseEntity.ok(reservationService.createReservation(entity, jwt.getSubject(), email, null));
    }

    @Operation(summary = "Update a reservation", description = "Updates an existing reservation. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Reservation updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Reservation not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(
            @Parameter(description = "Reservation UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateReservationRequest request
    ) {
        return ResponseEntity.ok(reservationService.updateReservation(request, id));
    }

    @Operation(summary = "Accept a reservation", description = "Marks a reservation as accepted. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reservation accepted"),
            @ApiResponse(responseCode = "404", description = "Reservation not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}/accept")
    public ResponseEntity<Void> acceptReservation(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Reservation UUID") @PathVariable UUID id
    ) {
        reservationService.acceptReservation(id, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reject a reservation", description = "Marks a reservation as rejected with an optional reason. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reservation rejected"),
            @ApiResponse(responseCode = "404", description = "Reservation not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectReservation(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Reservation UUID") @PathVariable UUID id,
            @RequestBody(required = false) UpdateRejectReservationRequest request
    ) {
        reservationService.rejectReservation(id, jwt.getSubject(), request != null ? request.reason() : null);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cancel a reservation", description = "Cancels a reservation. Requires role: user or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reservation cancelled"),
            @ApiResponse(responseCode = "404", description = "Reservation not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('user', 'admin')")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Reservation UUID") @PathVariable UUID id
    ) {
        String email = jwt.getClaimAsString("email");
        reservationService.cancelReservation(id, jwt.getSubject(), email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete a reservation", description = "Permanently deletes a reservation. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reservation deleted"),
            @ApiResponse(responseCode = "404", description = "Reservation not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(
            @Parameter(description = "Reservation UUID") @PathVariable UUID id
    ) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
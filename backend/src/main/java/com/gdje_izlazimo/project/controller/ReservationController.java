package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.service.ReservationService;
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
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PreAuthorize("hasRole('user')")
    @GetMapping("/me")
    public ResponseEntity<List<ReservationResponse>> findMyReservations(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir
    ) {
        Pageable pageable = PageRequest.of(
                pageNo - 1,
                pageSize,
                Sort.Direction.fromString(sortDir),
                sortBy
        );

        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(reservationService.findReservationsByUserId(userId, pageable));
    }

    @PreAuthorize("hasAnyRole('admin')")
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> findAllReservations( @RequestParam(defaultValue = "1") int pageNo,
                                                                          @RequestParam(defaultValue = "10") int pageSize,
                                                                          @RequestParam(defaultValue = "id") String sortBy,
                                                                          @RequestParam(defaultValue = "ASC") String sortDir){

        Pageable pageable = PageRequest.of(
                pageNo - 1,
                           pageSize,
                           Sort.Direction.fromString(sortDir),
                           sortBy);

        return ResponseEntity.ok(reservationService.findAllReservations(pageable));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> findReservationById(@PathVariable UUID id){
        return ResponseEntity.ok(reservationService.findReservationById(id));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<ReservationResponse>> findReservationsByVenue( @PathVariable UUID venueId,
                                                                              @RequestParam(defaultValue = "1") int pageNo,
                                                                              @RequestParam(defaultValue = "10") int pageSize,
                                                                              @RequestParam(defaultValue = "id") String sortBy,
                                                                              @RequestParam(defaultValue = "ASC") String sortDir) {
        Pageable pageable = PageRequest.of(
                pageNo - 1,
                           pageSize,
                           Sort.Direction.fromString(sortDir),
                           sortBy
        );

        return ResponseEntity.ok(reservationService.findReservationsByVenueId(venueId, pageable));
    }

    @PreAuthorize("hasAnyRole('user','venue_owner','admin')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponse>> findReservationsByUser( @PathVariable UUID userId,
                                                                             @RequestParam(defaultValue = "1") int pageNo,
                                                                             @RequestParam(defaultValue = "10") int pageSize,
                                                                             @RequestParam(defaultValue = "id") String sortBy,
                                                                             @RequestParam(defaultValue = "ASC") String sortDir) {
        Pageable pageable = PageRequest.of(
                pageNo - 1,
                           pageSize,
                           Sort.Direction.fromString(sortDir),
                           sortBy
        );

        return ResponseEntity.ok(reservationService.findReservationsByUserId(userId, pageable));
    }

    @PreAuthorize("hasRole('user')")
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@AuthenticationPrincipal Jwt jwt,
                                                                 @Valid @RequestBody CreateReservationRequest entity){
        return ResponseEntity.ok(reservationService.createReservation(entity, jwt.getSubject()));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(@PathVariable UUID id, @Valid @RequestBody UpdateReservationRequest request){
        return ResponseEntity.ok(reservationService.updateReservation(request, id));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}/accept")
    public ResponseEntity<Void> acceptReservation(@AuthenticationPrincipal Jwt jwt,
                                                                 @PathVariable UUID id){
        reservationService.cancelReservation(id, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> rejectReservation(@AuthenticationPrincipal Jwt jwt,
                                                                 @PathVariable UUID id){
        reservationService.cancelReservation(id, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('user', 'admin')")
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelReservation(@AuthenticationPrincipal Jwt jwt,
                                                                 @PathVariable UUID id){
        reservationService.cancelReservation(id, jwt.getSubject());
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable UUID id){
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}
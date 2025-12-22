package com.gdje_izlazimo.project.controller;


import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @PreAuthorize("hasRole('venue_owner')")
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> findAllReservations(){

        List<ReservationResponse> responses = reservationService.findAllReservations();
        return ResponseEntity.ok(responses);

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> findReservationById(@PathVariable UUID id){

        ReservationResponse response = reservationService.findReservationById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasRole('user')")
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody CreateReservationRequest entity){

        ReservationResponse reservationResponse = reservationService.createReservation(entity);
        return ResponseEntity.ok(reservationResponse);

    }

    @PreAuthorize("hasRole('venue_owner')")
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(@PathVariable UUID id,
                                                   @Valid @RequestBody UpdateReservationRequest request){
        ReservationResponse response = reservationService.updateReservation(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('venue_owner')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable UUID id){

        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}

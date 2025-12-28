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

    // findAllReservationsByVenue API is needed as soon as possible!

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> findAllReservations(@RequestParam(required = false, defaultValue = "1") int pageNo,
                                                                         @RequestParam(required = false, defaultValue = "10") int pageSize,
                                                                         @RequestParam(required = false, defaultValue = "id") String sortBy,
                                                                         @RequestParam(required = false, defaultValue = "ASC") String sortDir){


        Sort sort = null;

        if(sortDir.equalsIgnoreCase("ASC")){
            sort = Sort.by(sortBy).ascending();

        } else {
            sort = Sort.by(sortBy).descending();
        }

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, sort);
        List<ReservationResponse> responses = reservationService.findAllReservations(pageable);
        return ResponseEntity.ok(responses);

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> findReservationById(@PathVariable UUID id){

        ReservationResponse response = reservationService.findReservationById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody CreateReservationRequest entity){

        ReservationResponse reservationResponse = reservationService.createReservation(entity);
        return ResponseEntity.ok(reservationResponse);

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(@PathVariable UUID id,
                                                   @Valid @RequestBody UpdateReservationRequest request){
        ReservationResponse response = reservationService.updateReservation(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable UUID id){

        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}

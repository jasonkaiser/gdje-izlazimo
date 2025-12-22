package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.response.VenueOperatingHoursResponse;
import com.gdje_izlazimo.project.service.VenueOperatingHoursService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venue/operating-hours") // /venue-operating-hours
public class VenueOperatingHoursController {

    private final VenueOperatingHoursService venueOperatingHoursService;

    @Autowired
    public VenueOperatingHoursController(VenueOperatingHoursService venueOperatingHoursService) {
        this.venueOperatingHoursService = venueOperatingHoursService;
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueOperatingHoursResponse>> findAllVenueOperatingHours(){

        List<VenueOperatingHoursResponse> responses = venueOperatingHoursService.findAllVenueOperatingHours();
        return ResponseEntity.ok(responses);

    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueOperatingHoursResponse> findVenueOperatingHoursById(@PathVariable UUID id){

        VenueOperatingHoursResponse response = venueOperatingHoursService.findVenueOperatingHoursById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasRole('venue_owner')")
    @PostMapping
    public ResponseEntity<VenueOperatingHoursResponse> createVenueOperatingHours(@Valid @RequestBody CreateVenueOperatingHoursRequest entity){

        VenueOperatingHoursResponse venueOperatingHoursResponse = venueOperatingHoursService.createVenueOperatingHours(entity);
        return ResponseEntity.ok(venueOperatingHoursResponse);

    }

    @PreAuthorize("hasRole('venue_owner')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueOperatingHoursResponse> updateVenueOperatingHours(@PathVariable UUID id,
                                                                                 @Valid @RequestBody UpdateVenueOperatingHoursRequest request){
        VenueOperatingHoursResponse response = venueOperatingHoursService.updateVenueOperatingHours(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('venue_owner')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueOperatingHours(@PathVariable UUID id){

        venueOperatingHoursService.deleteVenueOperatingHours(id);
        return ResponseEntity.noContent().build();
    }
}
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
        return ResponseEntity.ok(venueOperatingHoursService.findAllVenueOperatingHours());

    }

    @PermitAll
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<VenueOperatingHoursResponse> findByVenueId(@PathVariable UUID venueId) {
        return ResponseEntity.ok(venueOperatingHoursService.findByVenueId(venueId));
    }


    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueOperatingHoursResponse> findVenueOperatingHoursById(@PathVariable UUID id){
        return ResponseEntity.ok(venueOperatingHoursService.findVenueOperatingHoursById(id));

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<VenueOperatingHoursResponse> createVenueOperatingHours(@Valid @RequestBody CreateVenueOperatingHoursRequest entity){
        return ResponseEntity.ok(venueOperatingHoursService.createVenueOperatingHours(entity));

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueOperatingHoursResponse> updateVenueOperatingHours(@PathVariable UUID id, @Valid @RequestBody UpdateVenueOperatingHoursRequest request){
        return ResponseEntity.ok(venueOperatingHoursService.updateVenueOperatingHours(request, id));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueOperatingHours(@PathVariable UUID id){
        venueOperatingHoursService.deleteVenueOperatingHours(id);
        return ResponseEntity.noContent().build();
    }
}
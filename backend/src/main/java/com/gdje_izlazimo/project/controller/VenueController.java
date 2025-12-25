package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.service.VenueService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venues")
public class VenueController {

    private final VenueService venueService;

    @Autowired
    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueResponse>> findAllVenues(@RequestParam(required = false) VenueCategory venueType){
        if(venueType != null){

            List<VenueResponse> venueResponses = venueService.findByVenueType(venueType);
            return ResponseEntity.ok(venueResponses);
        }

        List<VenueResponse> venueResponses = venueService.findAllVenues();
        return ResponseEntity.ok(venueResponses);
    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> findVenueById(UUID id){

        VenueResponse venueResponse = venueService.findVenueById(id);
        return ResponseEntity.ok(venueResponse);

    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody CreateVenueRequest dto){

        VenueResponse venueResponse = venueService.createVenue(dto);
        return ResponseEntity.ok(venueResponse);
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(@Valid @RequestBody UpdateVenueRequest dto,
                                                     @PathVariable UUID id){

        VenueResponse venueResponse = venueService.updateVenue(dto, id);
        return ResponseEntity.ok(venueResponse);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable UUID id){

        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }

}

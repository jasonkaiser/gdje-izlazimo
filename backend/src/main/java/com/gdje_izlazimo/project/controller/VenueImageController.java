package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueImageRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.service.VenueImageService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venue-images")
public class VenueImageController {

    private final VenueImageService venueImageService;

    @Autowired
    public VenueImageController(VenueImageService venueImageService) {
        this.venueImageService = venueImageService;
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueImageResponse>> findAllVenueImages(){

        List<VenueImageResponse> responses = venueImageService.findAllVenueImages();
        return ResponseEntity.ok(responses);

    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueImageResponse> findVenueImageById(@PathVariable UUID id){

        VenueImageResponse response = venueImageService.findVenueImageById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<VenueImageResponse> createVenueImage(@Valid @RequestBody CreateVenueImageRequest entity){

        VenueImageResponse venueImageResponse = venueImageService.createVenueImage(entity);
        return ResponseEntity.ok(venueImageResponse);

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueImageResponse> updateVenueImage(@PathVariable UUID id,
                                                               @Valid @RequestBody UpdateVenueImageRequest request){
        VenueImageResponse response = venueImageService.updateVenueImage(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueImage(@PathVariable UUID id){

        venueImageService.deleteVenueImage(id);
        return ResponseEntity.noContent().build();
    }
}
package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.service.VenueImageService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venue-images")
public class VenueImageController {

    private final VenueImageService venueImageService;

    public VenueImageController(VenueImageService venueImageService) {
        this.venueImageService = venueImageService;
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueImageResponse>> findAllVenueImages() {
        return ResponseEntity.ok(venueImageService.findAllVenueImages());
    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueImageResponse> findVenueImageById(@PathVariable UUID id) {
        return ResponseEntity.ok(venueImageService.findVenueImageById(id));
    }

    @PermitAll
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<VenueImageResponse>> findByVenueId(@PathVariable UUID venueId) {
        return ResponseEntity.ok(venueImageService.findByVenueId(venueId));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueImageResponse> uploadVenueImage(
            @RequestParam UUID venueId,
            @RequestParam MultipartFile file,
            @RequestParam(defaultValue = "false") boolean isPrimary) {
        return ResponseEntity.ok(venueImageService.uploadVenueImage(venueId, file, isPrimary));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueImageResponse> updateVenueImage(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateVenueImageRequest request) {
        return ResponseEntity.ok(venueImageService.updateVenueImage(request, id));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueImage(@PathVariable UUID id) {
        venueImageService.deleteVenueImage(id);
        return ResponseEntity.noContent().build();
    }
}
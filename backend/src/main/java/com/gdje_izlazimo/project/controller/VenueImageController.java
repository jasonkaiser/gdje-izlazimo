package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.service.VenueImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Venue Images", description = "Venue image management endpoints")
public class VenueImageController {

    private final VenueImageService venueImageService;

    public VenueImageController(VenueImageService venueImageService) {
        this.venueImageService = venueImageService;
    }

    @Operation(summary = "Get all venue images", description = "Returns a list of all venue images. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Images retrieved successfully")
    })
    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueImageResponse>> findAllVenueImages() {
        return ResponseEntity.ok(venueImageService.findAllVenueImages());
    }

    @Operation(summary = "Get venue image by ID", description = "Returns a single venue image by its UUID. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image found"),
            @ApiResponse(responseCode = "404", description = "Image not found")
    })
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueImageResponse> findVenueImageById(
            @Parameter(description = "Image UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(venueImageService.findVenueImageById(id));
    }

    @Operation(summary = "Get images by venue", description = "Returns all images for a specific venue. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Images retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @PermitAll
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<VenueImageResponse>> findByVenue(
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId) {
        return ResponseEntity.ok(venueImageService.findByVenue(venueId));
    }

    @Operation(summary = "Upload venue image", description = "Uploads a new image for a venue. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or parameters"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueImageResponse> uploadVenueImage(
            @Parameter(description = "Venue UUID") @RequestParam UUID venueId,
            @Parameter(description = "Image file to upload") @RequestParam MultipartFile file,
            @Parameter(description = "Set as primary image") @RequestParam(defaultValue = "false") boolean isPrimary) {
        return ResponseEntity.ok(venueImageService.uploadVenueImage(venueId, file, isPrimary));
    }

    @Operation(summary = "Update venue image", description = "Updates metadata of an existing venue image. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Image updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Image not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueImageResponse> updateVenueImage(
            @Parameter(description = "Image UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateVenueImageRequest request) {
        return ResponseEntity.ok(venueImageService.updateVenueImage(request, id));
    }

    @Operation(summary = "Delete venue image", description = "Permanently deletes a venue image. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Image deleted"),
            @ApiResponse(responseCode = "404", description = "Image not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueImage(
            @Parameter(description = "Image UUID") @PathVariable UUID id) {
        venueImageService.deleteVenueImage(id);
        return ResponseEntity.noContent().build();
    }
}
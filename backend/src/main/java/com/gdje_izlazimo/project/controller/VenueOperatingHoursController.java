package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.response.VenueOperatingHoursResponse;
import com.gdje_izlazimo.project.service.VenueOperatingHoursService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venue/operating-hours")
@Tag(name = "Venue Operating Hours", description = "Venue operating hours management endpoints")
public class VenueOperatingHoursController {

    private final VenueOperatingHoursService venueOperatingHoursService;

    @Autowired
    public VenueOperatingHoursController(VenueOperatingHoursService venueOperatingHoursService) {
        this.venueOperatingHoursService = venueOperatingHoursService;
    }

    @Operation(summary = "Get all operating hours", description = "Returns operating hours for all venues. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operating hours retrieved successfully")
    })
    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueOperatingHoursResponse>> findAllVenueOperatingHours() {
        return ResponseEntity.ok(venueOperatingHoursService.findAllVenueOperatingHours());
    }

    @Operation(summary = "Get operating hours by venue", description = "Returns operating hours for a specific venue. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operating hours found"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @PermitAll
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<VenueOperatingHoursResponse> findByVenueId(
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId) {
        return ResponseEntity.ok(venueOperatingHoursService.findByVenueId(venueId));
    }

    @Operation(summary = "Get operating hours by ID", description = "Returns a single operating hours record by its UUID. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operating hours found"),
            @ApiResponse(responseCode = "404", description = "Record not found")
    })
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueOperatingHoursResponse> findVenueOperatingHoursById(
            @Parameter(description = "Operating hours UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(venueOperatingHoursService.findVenueOperatingHoursById(id));
    }

    @Operation(summary = "Create operating hours", description = "Creates operating hours for a venue. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operating hours created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<VenueOperatingHoursResponse> createVenueOperatingHours(
            @Valid @RequestBody CreateVenueOperatingHoursRequest entity) {
        return ResponseEntity.ok(venueOperatingHoursService.createVenueOperatingHours(entity));
    }

    @Operation(summary = "Update operating hours", description = "Updates an existing operating hours record. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Operating hours updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueOperatingHoursResponse> updateVenueOperatingHours(
            @Parameter(description = "Operating hours UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateVenueOperatingHoursRequest request) {
        return ResponseEntity.ok(venueOperatingHoursService.updateVenueOperatingHours(request, id));
    }

    @Operation(summary = "Delete operating hours", description = "Permanently deletes an operating hours record. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Operating hours deleted"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueOperatingHours(
            @Parameter(description = "Operating hours UUID") @PathVariable UUID id) {
        venueOperatingHoursService.deleteVenueOperatingHours(id);
        return ResponseEntity.noContent().build();
    }
}
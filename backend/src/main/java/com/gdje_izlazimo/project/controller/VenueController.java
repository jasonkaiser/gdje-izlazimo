package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.VenueKind;
import com.gdje_izlazimo.project.service.VenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.PermitAll;
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
@RequestMapping("/venues")
@Tag(name = "Venues", description = "Venue management endpoints")
public class VenueController {

    private final VenueService venueService;

    @Autowired
    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @Operation(summary = "Get all venues", description = "Returns a paginated list of all venues, optionally filtered by category and/or venue kind. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venues retrieved successfully")
    })
    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueResponse>> findAllVenues(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "6") int pageSize,
            @Parameter(description = "Filter by venue category") @RequestParam(required = false) VenueCategory venueType,
            @Parameter(description = "Filter by venue kind (PARTNER or LISTED)") @RequestParam(required = false) VenueKind venueKind,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(venueService.searchVenues(null, venueType, venueKind, pageable));
    }

    @Operation(summary = "Get venue by ID", description = "Returns a single venue by its UUID. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue found"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> findVenueById(
            @Parameter(description = "Venue UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(venueService.findVenueById(id));
    }

    @Operation(summary = "Get my venue", description = "Returns the venue belonging to the currently authenticated venue owner. Requires role: venue_owner")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue found"),
            @ApiResponse(responseCode = "403", description = "Access denied"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/my-venue")
    public ResponseEntity<VenueResponse> getMyVenue(@AuthenticationPrincipal Jwt jwt) {
        UUID ownerId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(venueService.getVenueByOwnerId(ownerId));
    }

    @Operation(summary = "Search venues", description = "Search venues by name query and/or category and/or venue kind with pagination. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned successfully")
    })
    @PermitAll
    @GetMapping("/search")
    public ResponseEntity<List<VenueResponse>> searchVenues(
            @Parameter(description = "Search query (name)") @RequestParam(required = false) String query,
            @Parameter(description = "Filter by venue category") @RequestParam(required = false) VenueCategory venueType,
            @Parameter(description = "Filter by venue kind (PARTNER or LISTED)") @RequestParam(required = false) VenueKind venueKind,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "6") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "name") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(venueService.searchVenues(query, venueType, venueKind, pageable));
    }

    @Operation(summary = "Create a venue", description = "Creates a new venue. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody CreateVenueRequest dto) {
        return ResponseEntity.ok(venueService.createVenue(dto));
    }

    @Operation(summary = "Update a venue", description = "Updates an existing venue. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Venue not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(
            @Valid @RequestBody UpdateVenueRequest dto,
            @Parameter(description = "Venue UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(venueService.updateVenue(dto, id));
    }

    @Operation(summary = "Delete a venue", description = "Permanently deletes a venue. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Venue deleted"),
            @ApiResponse(responseCode = "404", description = "Venue not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(
            @Parameter(description = "Venue UUID") @PathVariable UUID id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }
}
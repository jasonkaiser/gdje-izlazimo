package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.VenueTableTypeResponse;
import com.gdje_izlazimo.project.service.VenueTableTypeService;
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
@RequestMapping("/venue/table-types")
@Tag(name = "Venue Table Types", description = "Venue table type assignment endpoints")
public class VenueTableTypeController {

    private final VenueTableTypeService venueTableTypeService;

    @Autowired
    public VenueTableTypeController(VenueTableTypeService venueTableTypeService) {
        this.venueTableTypeService = venueTableTypeService;
    }

    @Operation(summary = "Get all venue table types", description = "Returns all venue-table type associations. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue table types retrieved successfully")
    })
    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueTableTypeResponse>> findAllVenueTableTypes() {
        return ResponseEntity.ok(venueTableTypeService.findAllVenueTableTypes());
    }

    @Operation(summary = "Get venue table type by ID", description = "Returns a single venue table type by its UUID. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Record found"),
            @ApiResponse(responseCode = "404", description = "Record not found")
    })
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueTableTypeResponse> findVenueTableTypeById(
            @Parameter(description = "Venue table type UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(venueTableTypeService.findVenueTableTypeById(id));
    }

    @Operation(summary = "Get table types by venue", description = "Returns all table types assigned to a specific venue. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Table types retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @PermitAll
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<VenueTableTypeResponse>> findByVenue(
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId) {
        return ResponseEntity.ok(venueTableTypeService.findByVenue(venueId));
    }

    @Operation(summary = "Create venue table type", description = "Assigns a table type to a venue. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue table type created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueTableTypeResponse> createVenueTableType(
            @Valid @RequestBody CreateVenueTableTypeRequest entity) {
        return ResponseEntity.ok(venueTableTypeService.createVenueTableType(entity));
    }

    @Operation(summary = "Update venue table type", description = "Updates an existing venue table type assignment. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Venue table type updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueTableTypeResponse> updateVenueTableType(
            @Parameter(description = "Venue table type UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateVenueTableTypeRequest request) {
        return ResponseEntity.ok(venueTableTypeService.updateVenueTableType(request, id));
    }

    @Operation(summary = "Delete venue table type", description = "Removes a table type assignment from a venue. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Venue table type deleted"),
            @ApiResponse(responseCode = "404", description = "Record not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueTableType(
            @Parameter(description = "Venue table type UUID") @PathVariable UUID id) {
        venueTableTypeService.deleteVenueTableType(id);
        return ResponseEntity.noContent().build();
    }
}
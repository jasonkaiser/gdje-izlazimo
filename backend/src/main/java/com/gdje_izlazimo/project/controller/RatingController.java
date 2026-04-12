package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.dto.response.VenueRatingStatsResponse;
import com.gdje_izlazimo.project.repository.RatingRepository;
import com.gdje_izlazimo.project.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ratings")
@Tag(name = "Ratings", description = "Venue rating management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class RatingController {

    private final RatingService ratingService;
    private final RatingRepository ratingRepository;

    @Autowired
    public RatingController(RatingService ratingService, RatingRepository ratingRepository) {
        this.ratingService = ratingService;
        this.ratingRepository = ratingRepository;
    }

    @Operation(summary = "Get all ratings", description = "Returns a paginated list of all ratings. Requires role: user, venue_owner, or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ratings retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping
    public ResponseEntity<List<RatingResponse>> findAllRatings(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "5") int pageSize) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);
        return ResponseEntity.ok(ratingService.findAllRatings(pageable));
    }

    @Operation(summary = "Get rating by ID", description = "Returns a single rating by its UUID. Requires role: user, venue_owner, or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rating found"),
            @ApiResponse(responseCode = "404", description = "Rating not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> findRatingById(
            @Parameter(description = "Rating UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(ratingService.findRatingById(id));
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<RatingResponse>> findByVenue(@PathVariable UUID venueId) {
        return ResponseEntity.ok(ratingService.findByVenueId(venueId));
    }

    @GetMapping("/venue/{venueId}/stats")
    public ResponseEntity<VenueRatingStatsResponse> getVenueStats(@PathVariable UUID venueId) {
        return ResponseEntity.ok(ratingService.getVenueRatingStats(venueId));
    }

    @GetMapping("/exists/{reservationId}")
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    public ResponseEntity<Boolean> existsByReservation(@PathVariable UUID reservationId) {
        return ResponseEntity.ok(
                ratingRepository.existsByReservation_Id(reservationId)
        );
    }

    @Operation(summary = "Create a rating", description = "Creates a new venue rating. Requires role: user, venue_owner, or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rating created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest entity) {
        return ResponseEntity.ok(ratingService.createRating(entity));
    }

    @Operation(summary = "Update a rating", description = "Updates an existing rating. Requires role: user, venue_owner, or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rating updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Rating not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<RatingResponse> updateRating(
            @Parameter(description = "Rating UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateRatingRequest request) {
        return ResponseEntity.ok(ratingService.updateRating(request, id));
    }

    @Operation(summary = "Delete a rating", description = "Permanently deletes a rating. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Rating deleted"),
            @ApiResponse(responseCode = "404", description = "Rating not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(
            @Parameter(description = "Rating UUID") @PathVariable UUID id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
}
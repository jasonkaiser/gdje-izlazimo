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

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping
    public ResponseEntity<List<RatingResponse>> findAllRatings(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "5") int pageSize) {
        return ResponseEntity.ok(ratingService.findAllRatings(PageRequest.of(pageNo - 1, pageSize)));
    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> findRatingById(@PathVariable UUID id) {
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

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsByUserAndVenue(
            @RequestParam UUID venueId,
            @RequestParam UUID userId) {
        return ResponseEntity.ok(ratingRepository.existsByVenue_IdAndUser_Id(venueId, userId));
    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest entity) {
        return ResponseEntity.ok(ratingService.createRating(entity));
    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<RatingResponse> updateRating(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateRatingRequest request) {
        return ResponseEntity.ok(ratingService.updateRating(request, id));
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable UUID id) {
        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
}
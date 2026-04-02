package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.service.UserFavoriteVenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venues/favorites")
@Tag(name = "User Favorite Venues", description = "User favorite venues endpoints")
@SecurityRequirement(name = "bearerAuth")
public class UserFavoriteVenueController {

    private final UserFavoriteVenueService favoriteVenueService;

    @Autowired
    public UserFavoriteVenueController(UserFavoriteVenueService favoriteVenueService) {
        this.favoriteVenueService = favoriteVenueService;
    }

    @Operation(summary = "Add venue to favorites", description = "Adds a venue to the authenticated user's favorites. Requires role: user")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Venue added to favorites"),
            @ApiResponse(responseCode = "404", description = "Venue not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('user')")
    @PostMapping("/{venueId}")
    public ResponseEntity<Void> addFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId
    ) {
        favoriteVenueService.addFavorite(UUID.fromString(jwt.getSubject()), venueId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Remove venue from favorites", description = "Removes a venue from the authenticated user's favorites. Requires role: user")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Venue removed from favorites"),
            @ApiResponse(responseCode = "404", description = "Venue not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('user')")
    @DeleteMapping("/{venueId}")
    public ResponseEntity<Void> removeFavorite(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId
    ) {
        favoriteVenueService.removeFavorite(UUID.fromString(jwt.getSubject()), venueId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get favorite venues", description = "Returns the list of favorite venues for the authenticated user. Requires role: user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Favorites retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('user')")
    @GetMapping
    public ResponseEntity<List<VenueResponse>> getFavorites(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(favoriteVenueService.getFavorites(UUID.fromString(jwt.getSubject())));
    }
}
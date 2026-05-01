package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.service.EventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@Tag(name = "Events", description = "Event management endpoints")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    private List<String> extractRoles(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(a -> a.getAuthority().replace("ROLE_", ""))
                .toList();
    }

    @Operation(summary = "Get all events", description = "Returns a paginated list of all events. Public endpoint.")
    @ApiResponses({@ApiResponse(responseCode = "200", description = "Events retrieved successfully")})
    @PermitAll
    @GetMapping
    public ResponseEntity<List<EventResponse>> findAllEvents(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "7") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "eventDateTime") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(eventService.findAllEvents(pageable));
    }

    @Operation(summary = "Record View", description = "Record event views")
    @PostMapping("/{id}/view")
    @PermitAll
    public ResponseEntity<EventResponse> recordView(
            @PathVariable UUID id,
            HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null) ip = request.getRemoteAddr();
        return ResponseEntity.ok(eventService.recordViewAndFind(id, ip));
    }

    @Operation(summary = "Upcoming events", description = "Get upcoming events (future dates only)")
    @GetMapping("/upcoming")
    @PermitAll
    public ResponseEntity<List<EventResponse>> getUpcoming() {
        return ResponseEntity.ok(eventService.findUpcomingEvents());
    }

    @Operation(summary = "Trending events", description = "Get trending events")
    @GetMapping("/trending")
    @PermitAll
    public ResponseEntity<List<EventResponse>> getTrending() {
        return ResponseEntity.ok(eventService.findTrendingEvents());
    }

    @Operation(summary = "Search events", description = "Search events by query with pagination. Public endpoint.")
    @PermitAll
    @GetMapping("/search")
    public ResponseEntity<List<EventResponse>> searchEvents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(defaultValue = "eventDateTime") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir,
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "8") int pageSize) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(eventService.searchEvents(query, dateFrom, dateTo, pageable));
    }

    @Operation(summary = "Get event by ID", description = "Returns a single event by its UUID. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event found"),
            @ApiResponse(responseCode = "404", description = "Event not found")
    })
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> findEventById(
            @Parameter(description = "Event UUID") @PathVariable UUID id) {
        return ResponseEntity.ok(eventService.findEventById(id));
    }

    @Operation(summary = "Get events by venue", description = "Returns paginated events for a specific venue. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Events retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Venue not found")
    })
    @PermitAll
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<List<EventResponse>> findEventsByVenue(
            @Parameter(description = "Venue UUID") @PathVariable UUID venueId,
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "eventDateTime") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(eventService.findEventsByVenueId(venueId, pageable));
    }

    @Operation(summary = "Create an event", description = "Creates a new event for a venue. venue_owner may only create for their own venue.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @Valid @RequestBody CreateEventRequest entity) {
        return ResponseEntity.ok(eventService.createEvent(entity, jwt.getSubject(), extractRoles(authentication)));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<EventResponse> uploadEventImage(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(eventService.uploadEventImage(id, file, jwt.getSubject(), extractRoles(authentication)));
    }

    @DeleteMapping("/{id}/image")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<EventResponse> deleteEventImage(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @PathVariable UUID id) {
        return ResponseEntity.ok(eventService.deleteEventImage(id, jwt.getSubject(), extractRoles(authentication)));
    }

    @Operation(summary = "Update an event", description = "Updates an existing event. venue_owner may only update their own venue's events.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "404", description = "Event not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @Parameter(description = "Event UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(request, id, jwt.getSubject(), extractRoles(authentication)));
    }

    @Operation(summary = "Delete an event", description = "Permanently deletes an event. venue_owner may only delete their own venue's events.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Event deleted"),
            @ApiResponse(responseCode = "404", description = "Event not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication,
            @Parameter(description = "Event UUID") @PathVariable UUID id) {
        eventService.deleteEvent(id, jwt.getSubject(), extractRoles(authentication));
        return ResponseEntity.noContent().build();
    }
}
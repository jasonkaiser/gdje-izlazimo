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
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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

    @Operation(summary = "Get all events", description = "Returns a paginated list of all events. Public endpoint.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Events retrieved successfully")
    })
    @PermitAll
    @GetMapping
    public ResponseEntity<List<EventResponse>> findAllEvents(
            @Parameter(description = "Page number (1-based)") @RequestParam(defaultValue = "1") int pageNo,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "7") int pageSize,
            @Parameter(description = "Field to sort by") @RequestParam(defaultValue = "id") String sortBy,
            @Parameter(description = "Sort direction: ASC or DESC") @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, Sort.Direction.fromString(sortDir), sortBy);
        return ResponseEntity.ok(eventService.findAllEvents(pageable));
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

    @Operation(summary = "Create an event", description = "Creates a new event for a venue. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Event created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody CreateEventRequest entity) {
        return ResponseEntity.ok(eventService.createEvent(entity));
    }

    @Operation(summary = "Update an event", description = "Updates an existing event. Requires role: venue_owner or admin")
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
            @Parameter(description = "Event UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request) {
        return ResponseEntity.ok(eventService.updateEvent(request, id));
    }

    @Operation(summary = "Delete an event", description = "Permanently deletes an event. Requires role: venue_owner or admin")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Event deleted"),
            @ApiResponse(responseCode = "404", description = "Event not found"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @Parameter(description = "Event UUID") @PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
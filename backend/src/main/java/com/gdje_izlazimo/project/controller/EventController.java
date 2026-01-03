package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.service.EventService;
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
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<List<EventResponse>> findAllEvents(@RequestParam(defaultValue = "1") int pageNo,
                                                             @RequestParam(defaultValue = "7") int pageSize,
                                                             @RequestParam(defaultValue = "id") String sortBy,
                                                             @RequestParam(defaultValue = "ASC") String sortDir){


        Pageable pageable = PageRequest.of(
                pageNo - 1,
                           pageSize,
                           Sort.Direction.fromString(sortDir),
                           sortBy
        );

        return ResponseEntity.ok(eventService.findAllEvents(pageable));

    }
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> findEventById(@PathVariable UUID id){
        return ResponseEntity.ok(eventService.findEventById(id));

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody CreateEventRequest entity){
        return ResponseEntity.ok(eventService.createEvent(entity));

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable UUID id, @Valid @RequestBody UpdateEventRequest request){
        return ResponseEntity.ok(eventService.updateEvent(request, id));
    }

    @PreAuthorize("hasAnyRole('venue_owner','admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id){
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
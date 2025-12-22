package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.service.EventService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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
    public ResponseEntity<List<EventResponse>> findAllEvents(){

        List<EventResponse> responses = eventService.findAllEvents();
        return ResponseEntity.ok(responses);

    }
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> findEventById(@PathVariable UUID id){

        EventResponse response = eventService.findEventById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasRole('venue_owner')")
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody CreateEventRequest entity){

        EventResponse eventResponse = eventService.createEvent(entity);
        return ResponseEntity.ok(eventResponse);

    }

    @PreAuthorize("hasRole('venue_owner')")
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable UUID id,
                                                     @Valid @RequestBody UpdateEventRequest request){
        EventResponse response = eventService.updateEvent(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('venue_owner')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id){

        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
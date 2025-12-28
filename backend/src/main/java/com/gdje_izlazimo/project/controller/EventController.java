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
    public ResponseEntity<List<EventResponse>> findAllEvents(@RequestParam(required = false, defaultValue = "1") int pageNo,
                                                             @RequestParam(required = false, defaultValue = "7") int pageSize,
                                                             @RequestParam(required = false, defaultValue = "id") String sortBy,
                                                             @RequestParam(required = false, defaultValue = "ASC") String sortDir){


        Sort sort = null;

        if(sortDir.equalsIgnoreCase("ASC")){
            sort = Sort.by(sortBy).ascending();

        } else {
            sort = Sort.by(sortBy).descending();
        }

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, sort);
        List<EventResponse> responses = eventService.findAllEvents(pageable);
        return ResponseEntity.ok(responses);

    }
    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> findEventById(@PathVariable UUID id){

        EventResponse response = eventService.findEventById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<EventResponse> createEvent(@Valid @RequestBody CreateEventRequest entity){

        EventResponse eventResponse = eventService.createEvent(entity);
        return ResponseEntity.ok(eventResponse);

    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable UUID id,
                                                     @Valid @RequestBody UpdateEventRequest request){
        EventResponse response = eventService.updateEvent(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('venue_owner','admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id){

        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
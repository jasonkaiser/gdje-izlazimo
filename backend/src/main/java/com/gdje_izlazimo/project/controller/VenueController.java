package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.service.VenueService;
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
@RequestMapping("/venues")
public class VenueController {

    private final VenueService venueService;

    @Autowired
    public VenueController(VenueService venueService) {
        this.venueService = venueService;
    }

    @PermitAll
    @GetMapping
    public ResponseEntity<List<VenueResponse>> findAllVenues(@RequestParam(defaultValue = "1") int pageNo,
                                                             @RequestParam(defaultValue = "6") int pageSize,
                                                             @RequestParam(required = false) VenueCategory venueType,
                                                             @RequestParam(defaultValue = "id") String sortBy,
                                                             @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(
                pageNo - 1,
                pageSize,
                Sort.Direction.fromString(sortDir),
                sortBy
        );

        if (venueType != null) {
            return ResponseEntity.ok(venueService.findByVenueType(pageable, venueType));
        }

        return ResponseEntity.ok(venueService.findAllVenues(pageable));
    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> findVenueById(@PathVariable UUID id) {
        return ResponseEntity.ok(venueService.findVenueById(id));
    }

    @PermitAll
    @GetMapping("/search")
    public ResponseEntity<List<VenueResponse>> searchVenues(@RequestParam(required = false) String query,
                                                            @RequestParam(required = false) VenueCategory category,
                                                            @RequestParam(defaultValue = "1") int pageNo,
                                                            @RequestParam(defaultValue = "6") int pageSize,
                                                            @RequestParam(defaultValue = "name") String sortBy,
                                                            @RequestParam(defaultValue = "ASC") String sortDir) {

        Pageable pageable = PageRequest.of(
                pageNo - 1,
                pageSize,
                Sort.Direction.fromString(sortDir),
                sortBy
        );

        return ResponseEntity.ok(venueService.searchVenues(query, category, pageable));
    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody CreateVenueRequest dto) {
        return ResponseEntity.ok(venueService.createVenue(dto));
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(@Valid @RequestBody UpdateVenueRequest dto, @PathVariable UUID id) {
        return ResponseEntity.ok(venueService.updateVenue(dto, id));
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable UUID id) {
        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }
}

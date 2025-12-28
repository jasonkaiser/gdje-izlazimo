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
    public ResponseEntity<List<VenueResponse>> findAllVenues( @RequestParam(required = false, defaultValue = "1") int pageNo,
                                                              @RequestParam(required = false, defaultValue = "5") int pageSize,
                                                              @RequestParam(required = false) VenueCategory venueType,
                                                              @RequestParam(required = false, defaultValue = "id") String sortBy,
                                                              @RequestParam(required = false, defaultValue = "ASC") String sortDir){

        Sort sort = null;

        if(sortDir.equalsIgnoreCase("ASC")){
            sort = Sort.by(sortBy).ascending();

        } else {
            sort = Sort.by(sortBy).descending();
        }
        Pageable pageable = PageRequest.of(pageNo - 1, pageSize, sort);

        if(venueType != null){

            List<VenueResponse> venueResponses = venueService.findByVenueType(pageable, venueType);
            return ResponseEntity.ok(venueResponses);
        }

        List<VenueResponse> venueResponses = venueService.findAllVenues(pageable);
        return ResponseEntity.ok(venueResponses);
    }

    @PermitAll
    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> findVenueById(UUID id){

        VenueResponse venueResponse = venueService.findVenueById(id);
        return ResponseEntity.ok(venueResponse);

    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueResponse> createVenue(@Valid @RequestBody CreateVenueRequest dto){

        VenueResponse venueResponse = venueService.createVenue(dto);
        return ResponseEntity.ok(venueResponse);
    }

    @PreAuthorize("hasAnyRole('venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueResponse> updateVenue(@Valid @RequestBody UpdateVenueRequest dto,
                                                     @PathVariable UUID id){

        VenueResponse venueResponse = venueService.updateVenue(dto, id);
        return ResponseEntity.ok(venueResponse);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable UUID id){

        venueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }

}

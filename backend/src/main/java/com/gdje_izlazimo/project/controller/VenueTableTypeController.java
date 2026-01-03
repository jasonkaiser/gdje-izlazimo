package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.VenueTableTypeResponse;
import com.gdje_izlazimo.project.service.VenueTableTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/venue/table-types")
public class VenueTableTypeController {

    private final VenueTableTypeService venueTableTypeService;

    @Autowired
    public VenueTableTypeController(VenueTableTypeService venueTableTypeService) {
        this.venueTableTypeService = venueTableTypeService;
    }

    @PreAuthorize("hasAnyRole('user','venue_owner', 'admin')")
    @GetMapping
    public ResponseEntity<List<VenueTableTypeResponse>> findAllVenueTableTypes(){
        return ResponseEntity.ok(venueTableTypeService.findAllVenueTableTypes());

    }

    @PreAuthorize("hasAnyRole('user','venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<VenueTableTypeResponse> findVenueTableTypeById(@PathVariable UUID id){
        return ResponseEntity.ok(venueTableTypeService.findVenueTableTypeById(id));

    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueTableTypeResponse> createVenueTableType(@Valid @RequestBody CreateVenueTableTypeRequest entity){
        return ResponseEntity.ok(venueTableTypeService.createVenueTableType(entity));

    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueTableTypeResponse> updateVenueTableType(@PathVariable UUID id, @Valid @RequestBody UpdateVenueTableTypeRequest request){
        return ResponseEntity.ok(venueTableTypeService.updateVenueTableType(request, id));
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueTableType(@PathVariable UUID id){
        venueTableTypeService.deleteVenueTableType(id);
        return ResponseEntity.noContent().build();
    }
}
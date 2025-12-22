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

    @PreAuthorize("hasRole('user')")
    @GetMapping
    public ResponseEntity<List<VenueTableTypeResponse>> findAllVenueTableTypes(){

        List<VenueTableTypeResponse> responses = venueTableTypeService.findAllVenueTableTypes();
        return ResponseEntity.ok(responses);

    }

    @PreAuthorize("hasRole('user')")
    @GetMapping("/{id}")
    public ResponseEntity<VenueTableTypeResponse> findVenueTableTypeById(@PathVariable UUID id){

        VenueTableTypeResponse response = venueTableTypeService.findVenueTableTypeById(id);
        return ResponseEntity.ok(response);

    }

    @PreAuthorize("hasRole('admin')")
    @PostMapping
    public ResponseEntity<VenueTableTypeResponse> createVenueTableType(@Valid @RequestBody CreateVenueTableTypeRequest entity){

        VenueTableTypeResponse venueTableTypeResponse = venueTableTypeService.createVenueTableType(entity);
        return ResponseEntity.ok(venueTableTypeResponse);

    }

    @PreAuthorize("hasRole('admin')")
    @PutMapping("/{id}")
    public ResponseEntity<VenueTableTypeResponse> updateVenueTableType(@PathVariable UUID id,
                                                                       @Valid @RequestBody UpdateVenueTableTypeRequest request){
        VenueTableTypeResponse response = venueTableTypeService.updateVenueTableType(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenueTableType(@PathVariable UUID id){

        venueTableTypeService.deleteVenueTableType(id);
        return ResponseEntity.noContent().build();
    }
}
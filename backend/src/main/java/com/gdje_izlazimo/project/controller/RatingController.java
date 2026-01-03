package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ratings")
public class RatingController {

    private final RatingService ratingService;

    @Autowired
    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping
    public ResponseEntity<List<RatingResponse>> findAllRatings(@RequestParam(defaultValue = "1") int pageNo,
                                                               @RequestParam(defaultValue = "5") int pageSize){

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);
        return ResponseEntity.ok(ratingService.findAllRatings(pageable));

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> findRatingById(@PathVariable UUID id){
        return ResponseEntity.ok(ratingService.findRatingById(id));

    }
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest entity){
        return ResponseEntity.ok(ratingService.createRating(entity));

    }
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<RatingResponse> updateRating(@PathVariable UUID id, @Valid @RequestBody UpdateRatingRequest request){
        return ResponseEntity.ok(ratingService.updateRating(request, id));
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable UUID id){

        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
}
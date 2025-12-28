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
    public ResponseEntity<List<RatingResponse>> findAllRatings(@RequestParam(required = false, defaultValue = "1") int pageNo,
                                                               @RequestParam(required = false, defaultValue = "5") int pageSize){

        Pageable pageable = PageRequest.of(pageNo - 1, pageSize);

        List<RatingResponse> responses = ratingService.findAllRatings(pageable);
        return ResponseEntity.ok(responses);

    }

    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> findRatingById(@PathVariable UUID id){

        RatingResponse response = ratingService.findRatingById(id);
        return ResponseEntity.ok(response);

    }
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PostMapping
    public ResponseEntity<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest entity){

        RatingResponse ratingResponse = ratingService.createRating(entity);
        return ResponseEntity.ok(ratingResponse);

    }
    @PreAuthorize("hasAnyRole('user', 'venue_owner', 'admin')")
    @PutMapping("/{id}")
    public ResponseEntity<RatingResponse> updateRating(@PathVariable UUID id,
                                                       @Valid @RequestBody UpdateRatingRequest request){
        RatingResponse response = ratingService.updateRating(request, id);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRating(@PathVariable UUID id){

        ratingService.deleteRating(id);
        return ResponseEntity.noContent().build();
    }
}
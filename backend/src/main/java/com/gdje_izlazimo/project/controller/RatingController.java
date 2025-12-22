package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PreAuthorize("hasRole('user')")
    @GetMapping
    public ResponseEntity<List<RatingResponse>> findAllRatings(){

        List<RatingResponse> responses = ratingService.findAllRatings();
        return ResponseEntity.ok(responses);

    }

    @PreAuthorize("hasRole('user')")
    @GetMapping("/{id}")
    public ResponseEntity<RatingResponse> findRatingById(@PathVariable UUID id){

        RatingResponse response = ratingService.findRatingById(id);
        return ResponseEntity.ok(response);

    }
    @PreAuthorize("hasRole('user')")
    @PostMapping
    public ResponseEntity<RatingResponse> createRating(@Valid @RequestBody CreateRatingRequest entity){

        RatingResponse ratingResponse = ratingService.createRating(entity);
        return ResponseEntity.ok(ratingResponse);

    }
    @PreAuthorize("hasRole('admin')")
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
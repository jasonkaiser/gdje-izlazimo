package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueImageRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.entity.VenueImage;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VenueImageMapper {

    private final VenueRepository venueRepository;

    public VenueImageMapper(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public VenueImage toEntity(CreateVenueImageRequest dto){
        VenueImage createdEntity = new VenueImage();
        createdEntity.setImageUrl(dto.imageUrl());
        createdEntity.setPrimary(dto.isPrimary());

        Venue venue_id = venueRepository.findById(dto.venueId()).orElseThrow(
                () -> new RuntimeException("Venue not found"));

        createdEntity.setVenueId(venue_id);

        return createdEntity;
    }

    public void updateEntity(UpdateVenueImageRequest dto, VenueImage entity){
        entity.setImageUrl(dto.imageUrl());
        entity.setPrimary(dto.isPrimary());
    }

    public VenueImageResponse toResponse(VenueImage entity){
        return new VenueImageResponse(
                entity.getId(),
                entity.getVenueId().getId(),
                entity.getImageUrl(),
                entity.isPrimary(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }

}
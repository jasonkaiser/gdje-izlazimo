package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.response.VenueOperatingHoursResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.entity.VenueOperatingHours;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VenueOperatingHoursMapper {

    private final VenueRepository venueRepository;

    public VenueOperatingHoursMapper(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    public VenueOperatingHours toEntity(CreateVenueOperatingHoursRequest dto){
        VenueOperatingHours createdEntity = new VenueOperatingHours();
        createdEntity.setStartDay(dto.startDay());
        createdEntity.setEndDay(dto.endDay());
        createdEntity.setOpenTime(dto.openTime());
        createdEntity.setClosedTime(dto.closedTime());

        Venue venue_id = venueRepository.findById(dto.venueId()).orElseThrow(
                () -> new RuntimeException("Venue not found"));

        createdEntity.setVenueId(venue_id);

        return createdEntity;
    }

    public void updateEntity(UpdateVenueOperatingHoursRequest dto, VenueOperatingHours entity){
        entity.setStartDay(dto.startDay());
        entity.setEndDay(dto.endDay());
        entity.setOpenTime(dto.openTime());
        entity.setClosedTime(dto.closedTime());
    }

    public VenueOperatingHoursResponse toResponse(VenueOperatingHours entity){
        return new VenueOperatingHoursResponse(
                entity.getId(),
                entity.getVenueId().getId(),
                entity.getStartDay(),
                entity.getEndDay(),
                entity.getOpenTime(),
                entity.getClosedTime(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }

}
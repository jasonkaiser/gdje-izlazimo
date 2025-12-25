package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.repository.TableTypeRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    private final VenueRepository venueRepository;
    private final TableTypeRepository tableTypeRepository;

    public EventMapper(VenueRepository venueRepository, TableTypeRepository tableTypeRepository) {
        this.venueRepository = venueRepository;
        this.tableTypeRepository = tableTypeRepository;
    }

    public Event toEntity(CreateEventRequest dto){
        Event createdEntity = new Event();
        createdEntity.setEventStartTime(dto.eventStartTime());
        createdEntity.setEventDateTime(dto.eventDateTime());
        createdEntity.setName(dto.name());
        createdEntity.setImageUrl(dto.imageUrl());
        createdEntity.setQuantity(dto.quantity());

        Venue venue_id = venueRepository.findById(dto.venueId()).orElseThrow(
                () -> new RuntimeException("Venue not found"));

        createdEntity.setVenueId(venue_id);

        TableType tableType_id = tableTypeRepository.findById(dto.tableTypeId()).orElseThrow(
                () -> new RuntimeException("Table Type not found"));

        createdEntity.setTableTypeId(tableType_id);

        return createdEntity;
    }

    public void updateEntity(UpdateEventRequest dto, Event entity){
        entity.setEventStartTime(dto.eventStartTime());
        entity.setEventDateTime(dto.eventDateTime());
        entity.setName(dto.name());
        entity.setImageUrl(dto.imageUrl());
        entity.setQuantity(dto.quantity());
    }

    public EventResponse toResponse(Event entity){
        return new EventResponse(
                entity.getId(),
                entity.getVenueId().getId(),
                entity.getTableTypeId().getId(),
                entity.getEventStartTime(),
                entity.getEventDateTime(),
                entity.getName(),
                entity.getImageUrl(),
                entity.getQuantity(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }

}
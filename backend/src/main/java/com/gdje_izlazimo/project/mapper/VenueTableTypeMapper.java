package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.VenueTableTypeResponse;
import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.entity.VenueTableType;
import com.gdje_izlazimo.project.repository.TableTypeRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VenueTableTypeMapper {

    private final VenueRepository venueRepository;
    private final TableTypeRepository tableTypeRepository;

    public VenueTableTypeMapper(VenueRepository venueRepository, TableTypeRepository tableTypeRepository) {
        this.venueRepository = venueRepository;
        this.tableTypeRepository = tableTypeRepository;
    }

    public VenueTableType toEntity(CreateVenueTableTypeRequest dto){
        VenueTableType createdEntity = new VenueTableType();
        createdEntity.setQuantity(dto.quantity());

        Venue venue_id = venueRepository.findById(dto.venueId()).orElseThrow(
                () -> new RuntimeException("Venue not found"));

        createdEntity.setVenueId(venue_id);

        TableType tableType_id = tableTypeRepository.findById(dto.tableTypeId()).orElseThrow(
                () -> new RuntimeException("Table Type not found"));

        createdEntity.setTableTypeId(tableType_id);

        return createdEntity;
    }

    public void updateEntity(UpdateVenueTableTypeRequest dto, VenueTableType entity){
        entity.setQuantity(dto.quantity());
    }

    public VenueTableTypeResponse toResponse(VenueTableType entity){
        return new VenueTableTypeResponse(
                entity.getId(),
                entity.getVenueId().getId(),
                entity.getTableTypeId().getId(),
                entity.getQuantity(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }

}
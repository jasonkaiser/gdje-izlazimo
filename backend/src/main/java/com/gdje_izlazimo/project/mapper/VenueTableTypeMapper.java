package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.VenueTableTypeResponse;
import com.gdje_izlazimo.project.entity.VenueTableType;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = SharedMapperHelper.class)
public interface VenueTableTypeMapper {

    @Mapping(source = "venueId",     target = "venue",      qualifiedByName = "resolveVenue")
    @Mapping(source = "tableTypeId", target = "tableType",  qualifiedByName = "resolveTableType")
    VenueTableType toEntity(CreateVenueTableTypeRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateVenueTableTypeRequest dto, @MappingTarget VenueTableType entity);

    @Mapping(source = "venue.id",     target = "venueId")
    @Mapping(source = "tableType.id", target = "tableTypeId")
    VenueTableTypeResponse toResponse(VenueTableType entity);
}
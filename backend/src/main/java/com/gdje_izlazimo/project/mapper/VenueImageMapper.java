package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueImageRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.entity.VenueImage;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = SharedMapperHelper.class)
public interface VenueImageMapper {

    @Mapping(source = "venueId",  target = "venue",   qualifiedByName = "resolveVenue")
    VenueImage toEntity(CreateVenueImageRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateVenueImageRequest dto, @MappingTarget VenueImage entity);

    @Mapping(source = "venue.id", target = "venueId")
    VenueImageResponse toResponse(VenueImage entity);
}
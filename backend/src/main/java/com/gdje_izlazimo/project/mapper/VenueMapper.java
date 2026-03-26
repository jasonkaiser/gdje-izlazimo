package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {SharedMapperHelper.class, VenueImageMapper.class})
public interface VenueMapper {

    @Mapping(source = "venueOwnerId", target = "venueOwner", qualifiedByName = "resolveUser")
    @Mapping(source = "isActive", target = "active")
    Venue toEntity(CreateVenueRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(source = "isActive", target = "active")
    void updateEntity(UpdateVenueRequest dto, @MappingTarget Venue venue);

    @Mapping(target = "images", source = "images")
    VenueResponse toResponse(Venue venue);
}
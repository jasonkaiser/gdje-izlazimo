package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.response.VenueOperatingHoursResponse;
import com.gdje_izlazimo.project.entity.VenueOperatingHours;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;


@Mapper(componentModel = "spring", uses = SharedMapperHelper.class)
public interface VenueOperatingHoursMapper {

    @Mapping(source = "venueId", target = "venue", qualifiedByName = "resolveVenue")
    VenueOperatingHours toEntity(CreateVenueOperatingHoursRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateVenueOperatingHoursRequest dto, @MappingTarget VenueOperatingHours entity);

    @Mapping(source = "venue.id", target = "venueId")
    VenueOperatingHoursResponse toResponse(VenueOperatingHours entity);
}
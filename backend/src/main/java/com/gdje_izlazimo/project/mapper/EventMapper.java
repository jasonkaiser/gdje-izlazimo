package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;


@Mapper(componentModel = "spring", uses = SharedMapperHelper.class)
public interface EventMapper {

    @Mapping(source = "venueId",     target = "venueId",     qualifiedByName = "resolveVenue")
    @Mapping(source = "tableTypeId", target = "tableTypeId", qualifiedByName = "resolveTableType")
    Event toEntity(CreateEventRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateEventRequest dto, @MappingTarget Event entity);

    @Mapping(source = "venueId.id",     target = "venueId")
    @Mapping(source = "tableTypeId.id", target = "tableTypeId")
    EventResponse toResponse(Event entity);
}
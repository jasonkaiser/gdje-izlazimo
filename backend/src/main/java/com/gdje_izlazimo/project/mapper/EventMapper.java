package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {SharedMapperHelper.class})
public interface EventMapper {

    @Mapping(source = "venueId", target = "venue", qualifiedByName = "resolveVenue")
    Event toEntity(CreateEventRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "venue", ignore = true)
    void updateEntity(UpdateEventRequest dto, @MappingTarget Event event);

    @Mapping(source = "venue.id",          target = "venueId")
    @Mapping(source = "venue.name",        target = "venueName")
    @Mapping(source = "venue.venueType",   target = "venueType")
    @Mapping(source = "venue.addressName", target = "venueAddress")
    @Mapping(target = "viewCount",         constant = "0L")
    @Mapping(target = "trending",          constant = "false")
    EventResponse toResponse(Event event);

    default EventResponse toResponse(Event event, long viewCount, boolean trending) {
        EventResponse r = toResponse(event);
        return new EventResponse(
                r.id(), r.venueId(), r.venueName(), r.venueType(), r.venueAddress(),
                r.name(), r.description(), r.eventDateTime(), r.imageUrl(),
                viewCount, trending,
                r.createdAt(), r.updatedAt()
        );
    }
}
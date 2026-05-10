package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.EventTicketTypeRequest;
import com.gdje_izlazimo.project.dto.request.create.CreateEventRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateEventRequest;
import com.gdje_izlazimo.project.dto.response.EventResponse;
import com.gdje_izlazimo.project.dto.response.EventTicketTypeResponse;
import com.gdje_izlazimo.project.entity.Event;
import com.gdje_izlazimo.project.entity.EventTicketType;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SharedMapperHelper.class})
public interface EventMapper {


    @Mapping(source = "venueId", target = "venue", qualifiedByName = "resolveVenueNullable")
    @Mapping(source = "ticketTypes", target = "ticketTypes", qualifiedByName = "mapTicketTypeList")
    @Mapping(target = "featured",   source = "featured",   defaultValue = "false")
    @Mapping(target = "eventType",  source = "eventType",  defaultExpression = "java(com.gdje_izlazimo.project.enums.EventType.OTHER)")
    @Mapping(target = "imageUrl",    ignore = true)
    @Mapping(target = "imageFileId", ignore = true)
    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "updatedAt",   ignore = true)
    Event toEntity(CreateEventRequest dto);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "venue",       ignore = true)
    @Mapping(target = "ticketTypes", ignore = true)
    @Mapping(target = "imageUrl",    ignore = true)
    @Mapping(target = "imageFileId", ignore = true)
    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "updatedAt",   ignore = true)
    void updateEntity(UpdateEventRequest dto, @MappingTarget Event event);



    @Mapping(source = "venue.id",          target = "venueId")
    @Mapping(source = "venue.name",        target = "venueName")
    @Mapping(source = "venue.venueType",   target = "venueType")
    @Mapping(source = "venue.addressName", target = "venueAddress")
    @Mapping(target = "displayLocationName",    ignore = true)
    @Mapping(target = "displayLocationAddress", ignore = true)
    @Mapping(target = "ticketTypes",       ignore = true)
    @Mapping(target = "hasTickets",        ignore = true)
    @Mapping(target = "primaryTicketUrl",  ignore = true)
    @Mapping(target = "viewCount",  constant = "0L")
    @Mapping(target = "trending",   constant = "false")
    @Mapping(target = "latitude",  ignore = true)
    @Mapping(target = "longitude", ignore = true)
    EventResponse toResponseBase(Event event);


    default EventResponse toResponse(Event event, long viewCount, boolean trending) {
        EventResponse base = toResponseBase(event);

        String displayLocationName    = base.venueName()    != null ? base.venueName()    : event.getLocationName();
        String displayLocationAddress = base.venueAddress() != null ? base.venueAddress() : event.getLocationAddress();

        List<EventTicketTypeResponse> tickets = event.getTicketTypes().stream()
                .filter(t -> Boolean.TRUE.equals(t.getActive()))
                .sorted((a, b) -> Integer.compare(
                        a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                        b.getDisplayOrder() != null ? b.getDisplayOrder() : 0))
                .map(this::toTicketResponse)
                .toList();

        boolean hasTickets      = !tickets.isEmpty();
        String primaryTicketUrl = hasTickets ? tickets.get(0).purchaseUrl() : null;

        Double lat = event.getLatitude() != null
                ? event.getLatitude()
                : (event.getVenue() != null ? event.getVenue().getLatitude() : null);

        Double lng = event.getLongitude() != null
                ? event.getLongitude()
                : (event.getVenue() != null ? event.getVenue().getLongitude() : null);

        return new EventResponse(
                base.id(),
                base.venueId(),
                base.venueName(),
                base.venueType(),
                base.venueAddress(),
                base.name(),
                base.description(),
                base.eventDateTime(),
                base.eventEndDateTime(),
                base.locationName(),
                base.locationAddress(),
                displayLocationName,
                displayLocationAddress,
                base.eventType(),
                base.externalOrganizerName(),
                base.externalOrganizerInstagram(),
                base.featured(),
                base.imageUrl(),
                tickets,
                hasTickets,
                primaryTicketUrl,
                viewCount,
                trending,
                lat,
                lng,
                base.createdAt(),
                base.updatedAt()
        );
    }

    default EventResponse toResponse(Event event) {
        return toResponse(event, 0L, false);
    }



    @Named("mapTicketType")
    @Mapping(target = "id",           ignore = true)
    @Mapping(target = "event",        ignore = true)
    @Mapping(target = "currency",     defaultValue = "BAM")
    @Mapping(target = "active",       defaultValue = "true")
    @Mapping(target = "displayOrder", defaultValue = "0")
    @Mapping(target = "createdAt",    ignore = true)
    @Mapping(target = "updatedAt",    ignore = true)
    EventTicketType toTicketEntity(EventTicketTypeRequest dto);

    @IterableMapping(qualifiedByName = "mapTicketType")
    @Named("mapTicketTypeList")
    List<EventTicketType> toTicketEntityList(List<EventTicketTypeRequest> dtos);

    EventTicketTypeResponse toTicketResponse(EventTicketType ticket);

    @AfterMapping
    default void linkTicketTypesToEvent(@MappingTarget Event event) {
        if (event.getTicketTypes() != null) {
            event.getTicketTypes().forEach(ticket -> ticket.setEvent(event));
        }
    }
}
package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateReservationRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateReservationRequest;
import com.gdje_izlazimo.project.dto.response.ReservationResponse;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;


@Mapper(componentModel = "spring", uses = SharedMapperHelper.class,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS)
public interface ReservationMapper {

    @Mapping(source = "venueId", target = "venue", qualifiedByName = "resolveVenue")
    Reservation toEntity(CreateReservationRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateReservationRequest dto, @MappingTarget Reservation entity);

    @Mapping(source = "user.id",          target = "userId")
    @Mapping(source = "venue.id",         target = "venueId")
    @Mapping(source = "venue.venueType",   target = "venueType")
    @Mapping(source = "venue.name",       target = "venueName")
    @Mapping(source = "venue.addressName",target = "venueAddress")
    @Mapping(source = "tableType.id",     target = "tableTypeId")
    ReservationResponse toResponse(Reservation entity);
}
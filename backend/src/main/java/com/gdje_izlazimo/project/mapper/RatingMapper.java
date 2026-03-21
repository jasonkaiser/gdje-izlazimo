package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.entity.Rating;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;


@Mapper(componentModel = "spring", uses = SharedMapperHelper.class)
public interface RatingMapper {

    @Mapping(source = "reservationId", target = "reservationId", qualifiedByName = "resolveReservation")
    @Mapping(source = "userId",        target = "userId",        qualifiedByName = "resolveUser")
    Rating toEntity(CreateRatingRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateRatingRequest dto, @MappingTarget Rating entity);

    @Mapping(source = "reservationId.id", target = "reservationId")
    @Mapping(source = "userId.id",        target = "userId")
    RatingResponse toResponse(Rating entity);
}
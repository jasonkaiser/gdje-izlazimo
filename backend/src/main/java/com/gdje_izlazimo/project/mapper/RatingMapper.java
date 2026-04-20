package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateRatingRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateRatingRequest;
import com.gdje_izlazimo.project.dto.response.RatingResponse;
import com.gdje_izlazimo.project.entity.Rating;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.*;


@Mapper(componentModel = "spring", uses = SharedMapperHelper.class)
public interface RatingMapper {

    @Mapping(source = "userId",  target = "user",  qualifiedByName = "resolveUser")
    @Mapping(source = "venueId", target = "venue", qualifiedByName = "resolveVenue")
    Rating toEntity(CreateRatingRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateRatingRequest dto, @MappingTarget Rating entity);

    @Mapping(source = "venue.id",             target = "venueId")
    @Mapping(source = "user.id",              target = "userId")
    @Mapping(source = "user.name",            target = "userName")
    @Mapping(source = "user.profileImageUrl", target = "profileImageUrl")
    RatingResponse toResponse(Rating entity);
}
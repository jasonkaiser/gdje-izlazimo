package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.response.ActivityLogResponse;
import com.gdje_izlazimo.project.entity.ActivityLog;
import com.gdje_izlazimo.project.mapper.helper.SharedMapperHelper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.UUID;
//
@Mapper(componentModel = "spring")
public interface ActivityLogMapper {

    @Mapping(source = "entityId", target = "entityId", qualifiedByName = "stringToUUID")
    ActivityLogResponse toResponse(ActivityLog entity);

    @Named("stringToUUID")
    default UUID stringToUUID(String id) {
        return id != null ? UUID.fromString(id) : null;
    }
}
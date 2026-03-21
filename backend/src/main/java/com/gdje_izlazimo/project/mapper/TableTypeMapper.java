package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.TableTypeResponse;
import com.gdje_izlazimo.project.entity.TableType;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface TableTypeMapper {

    TableType toEntity(CreateTableTypeRequest dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateTableTypeRequest dto, @MappingTarget TableType entity);

    TableTypeResponse toResponse(TableType entity);
}
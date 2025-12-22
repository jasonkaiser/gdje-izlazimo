package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.TableTypeResponse;
import com.gdje_izlazimo.project.entity.TableType;
import org.springframework.stereotype.Component;

@Component
public class TableTypeMapper {

    public TableType toEntity(CreateTableTypeRequest dto){
        TableType createdEntity = new TableType();
        createdEntity.setName(dto.name());
        createdEntity.setDescription(dto.description());

        return createdEntity;
    }

    public void updateEntity(UpdateTableTypeRequest dto, TableType entity){
        entity.setName(dto.name());
        entity.setDescription(dto.description());
    }

    public TableTypeResponse toResponse(TableType entity){
        return new TableTypeResponse(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getCreated_at(),
                entity.getUpdated_at()
        );
    }

}
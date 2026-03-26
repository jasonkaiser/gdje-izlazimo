package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.TableTypeResponse;
import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.exception.custom.TableTypeNotFoundException;
import com.gdje_izlazimo.project.mapper.TableTypeMapper;
import com.gdje_izlazimo.project.repository.TableTypeRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TableTypeService {

    private final TableTypeRepository tableTypeRepository;
    private final TableTypeMapper tableTypeMapper;

    public TableTypeService(TableTypeRepository tableTypeRepository, TableTypeMapper tableTypeMapper) {
        this.tableTypeRepository = tableTypeRepository;
        this.tableTypeMapper = tableTypeMapper;
    }

    @Cacheable(value = "tableTypes", unless = "#result == null || #result.isEmpty()")
    public List<TableTypeResponse> findAllTableTypes(){

        List<TableType> responses = tableTypeRepository.findAll();

        return responses.stream()
                .map(tableTypeMapper::toResponse)
                .toList();

    }

    public TableTypeResponse findTableTypeById(UUID id){

        TableType response = tableTypeRepository.findById(id).orElseThrow(
                () -> new TableTypeNotFoundException("Table Type does not exist"));

        return tableTypeMapper.toResponse(response);

    }

    public TableType findEntityById(UUID id){

        return tableTypeRepository.findById(id).orElseThrow(
                () -> new TableTypeNotFoundException("Table Type does not exist"));
    };

    @CacheEvict(value = "tableTypes", allEntries = true)
    public TableTypeResponse createTableType(CreateTableTypeRequest dto){

        TableType createdTableType = tableTypeMapper.toEntity(dto);
        TableType savedTableType = tableTypeRepository.save(createdTableType);

        return tableTypeMapper.toResponse(savedTableType);

    }

    @CacheEvict(value = "tableTypes", allEntries = true)
    public TableTypeResponse updateTableType(UpdateTableTypeRequest dto, UUID id){

        TableType tableType = tableTypeRepository.findById(id).orElseThrow(
                () -> new TableTypeNotFoundException("Table Type does not exist"));

        tableTypeMapper.updateEntity(dto, tableType);
        TableType updatedTableType = tableTypeRepository.save(tableType);

        return tableTypeMapper.toResponse(updatedTableType);

    }

    @CacheEvict(value = "tableTypes", allEntries = true)
    public void deleteTableType(UUID id){

        if(!tableTypeRepository.existsById(id)){
            throw new TableTypeNotFoundException("Table Type does not exist");
        }
        tableTypeRepository.deleteById(id);

    }

}
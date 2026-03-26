package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.VenueTableTypeResponse;
import com.gdje_izlazimo.project.entity.VenueTableType;
import com.gdje_izlazimo.project.exception.custom.VenueTableTypeAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.VenueTableTypeNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueTableTypeMapper;
import com.gdje_izlazimo.project.repository.VenueTableTypeRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VenueTableTypeService {

    private final VenueTableTypeRepository venueTableTypeRepository;
    private final VenueTableTypeMapper venueTableTypeMapper;

    public VenueTableTypeService(VenueTableTypeRepository venueTableTypeRepository,
                                 VenueTableTypeMapper venueTableTypeMapper) {
        this.venueTableTypeRepository = venueTableTypeRepository;
        this.venueTableTypeMapper = venueTableTypeMapper;
    }

    @Cacheable("venueTableTypesAll")
    public List<VenueTableTypeResponse> findAllVenueTableTypes() {
        return venueTableTypeRepository.findAllWithVenueAndTableType()
                .stream()
                .map(venueTableTypeMapper::toResponse)
                .toList();
    }

    @Cacheable(value="venueTableTypes", key="#venueId")
    public List<VenueTableTypeResponse> findByVenue(UUID venueId) {
        return venueTableTypeRepository.findByVenueIdWithVenueAndTableType(venueId)
                .stream()
                .map(venueTableTypeMapper::toResponse)
                .toList();
    }

    public VenueTableTypeResponse findVenueTableTypeById(UUID id){
        return venueTableTypeRepository.findById(id)
                .map(venueTableTypeMapper::toResponse)
                .orElseThrow(() -> new VenueTableTypeNotFoundException("Venue Table Type does not exist"));
    }


    @Caching(evict = {
            @CacheEvict(value="venueTableTypes", key="#dto.venueId"),
            @CacheEvict(value="venueTableTypesAll", allEntries = true)
    })
    public VenueTableTypeResponse createVenueTableType(CreateVenueTableTypeRequest dto){
        if (venueTableTypeRepository.existsByVenue_IdAndTableType_Id(dto.venueId(), dto.tableTypeId())) {
            throw new VenueTableTypeAlreadyExistsException("This Venue already has this Table Type");
        }
        VenueTableType entity = venueTableTypeMapper.toEntity(dto);
        return venueTableTypeMapper.toResponse(venueTableTypeRepository.save(entity));
    }

    @Caching(evict = {
            @CacheEvict(value="venueTableTypes", key="#dto.venueId"),
            @CacheEvict(value="venueTableTypesAll", allEntries = true)
    })
    public VenueTableTypeResponse updateVenueTableType(UpdateVenueTableTypeRequest dto, UUID id){
        VenueTableType entity = venueTableTypeRepository.findById(id)
                .orElseThrow(() -> new VenueTableTypeNotFoundException("Venue Table Type does not exist"));

        venueTableTypeMapper.updateEntity(dto, entity);
        return venueTableTypeMapper.toResponse(venueTableTypeRepository.save(entity));
    }

    @CacheEvict(value="venueTableTypesAll", allEntries = true)
    public void deleteVenueTableType(UUID id){
        VenueTableType entity = venueTableTypeRepository.findById(id)
                .orElseThrow(() -> new VenueTableTypeNotFoundException("Venue Table Type does not exist"));
        venueTableTypeRepository.delete(entity);
    }
}
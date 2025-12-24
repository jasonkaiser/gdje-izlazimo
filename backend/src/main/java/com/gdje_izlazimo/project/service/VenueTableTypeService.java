package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueTableTypeRequest;
import com.gdje_izlazimo.project.dto.response.VenueTableTypeResponse;
import com.gdje_izlazimo.project.entity.VenueTableType;
import com.gdje_izlazimo.project.exception.custom.VenueTableTypeAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.VenueTableTypeNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueTableTypeMapper;
import com.gdje_izlazimo.project.repository.VenueTableTypeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VenueTableTypeService {

    private final VenueTableTypeRepository venueTableTypeRepository;
    private final VenueTableTypeMapper venueTableTypeMapper;

    public VenueTableTypeService(VenueTableTypeRepository venueTableTypeRepository, VenueTableTypeMapper venueTableTypeMapper) {
        this.venueTableTypeRepository = venueTableTypeRepository;
        this.venueTableTypeMapper = venueTableTypeMapper;
    }

    public List<VenueTableTypeResponse> findAllVenueTableTypes(){

        List<VenueTableType> responses = venueTableTypeRepository.findAll();

        return responses.stream()
                .map(venueTableTypeMapper::toResponse)
                .toList();

    }

    public VenueTableTypeResponse findVenueTableTypeById(UUID id){

        VenueTableType response = venueTableTypeRepository.findById(id).orElseThrow(
                () -> new VenueTableTypeNotFoundException("Venue Table Type does not exist"));

        return venueTableTypeMapper.toResponse(response);

    }

    public VenueTableTypeResponse createVenueTableType(CreateVenueTableTypeRequest dto){

        if (venueTableTypeRepository.existsByVenueId_IdAndTableTypeId_Id(dto.venueId(), dto.tableTypeId())) {
            throw new VenueTableTypeAlreadyExistsException("This Venue already has this Table Type");
        }

        VenueTableType createdVenueTableType = venueTableTypeMapper.toEntity(dto);
        VenueTableType savedVenueTableType = venueTableTypeRepository.save(createdVenueTableType);

        return venueTableTypeMapper.toResponse(savedVenueTableType);

    }

    public VenueTableTypeResponse updateVenueTableType(UpdateVenueTableTypeRequest dto, UUID id){

        VenueTableType venueTableType = venueTableTypeRepository.findById(id).orElseThrow(
                () -> new VenueTableTypeNotFoundException("Venue Table Type does not exist"));

        venueTableTypeMapper.updateEntity(dto, venueTableType);
        VenueTableType updatedVenueTableType = venueTableTypeRepository.save(venueTableType);

        return venueTableTypeMapper.toResponse(updatedVenueTableType);

    }

    public void deleteVenueTableType(UUID id){

        if(!venueTableTypeRepository.existsById(id)){
            throw new VenueTableTypeNotFoundException("Venue Table Type does not exist");
        }
        venueTableTypeRepository.deleteById(id);

    }

}
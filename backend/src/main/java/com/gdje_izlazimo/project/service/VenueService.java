package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.exception.custom.VenueAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.VenueNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueMapper;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    @Autowired
    public VenueService(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    public List<VenueResponse> findAllVenues(){
        List<Venue> venueEntity = venueRepository.findAll();
        return venueEntity.stream()
                .map(venueMapper::toResponse)
                .toList();
    }

    public VenueResponse findVenueById(UUID id){
        Venue venueEntity = venueRepository.findById(id).orElseThrow(
                () -> new VenueNotFoundException("Venue does not exist"));

        return venueMapper.toResponse(venueEntity);
    }

    public List<VenueResponse> findByVenueType(VenueCategory venueType){
        List<Venue> venues = venueRepository.findByVenueType(venueType);
        return venues.stream()
                .map(venueMapper::toResponse)
                .toList();
    }

    public VenueResponse createVenue(CreateVenueRequest dto){
        if(venueRepository.existsByName(dto.name())){
            throw new VenueAlreadyExistsException("Venue with this name already exists");
        }

        Venue newVenue = venueMapper.toEntity(dto);
        Venue savedVenue = venueRepository.save(newVenue);

        return venueMapper.toResponse(savedVenue);
    }

    public VenueResponse updateVenue(UpdateVenueRequest dto, UUID id){
        Venue venue = venueRepository.findById(id).orElseThrow(
                () -> new VenueNotFoundException("Venue does not exist"));

        venueMapper.updateEntity(venue, dto);
        Venue updatedVenue = venueRepository.save(venue);

        return venueMapper.toResponse(updatedVenue);
    }

    public void deleteVenue(UUID id){
        if(!venueRepository.existsById(id)){
            throw new VenueNotFoundException("Venue does not exist");
        }
        venueRepository.deleteById(id);
    }
}
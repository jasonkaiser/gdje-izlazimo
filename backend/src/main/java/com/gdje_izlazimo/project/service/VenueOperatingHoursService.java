package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.response.VenueOperatingHoursResponse;
import com.gdje_izlazimo.project.entity.VenueOperatingHours;
import com.gdje_izlazimo.project.exception.custom.VenueOperatingHoursNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueOperatingHoursMapper;
import com.gdje_izlazimo.project.repository.VenueOperatingHoursRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VenueOperatingHoursService {

    private final VenueOperatingHoursRepository venueOperatingHoursRepository;
    private final VenueOperatingHoursMapper venueOperatingHoursMapper;

    public VenueOperatingHoursService(VenueOperatingHoursRepository venueOperatingHoursRepository, VenueOperatingHoursMapper venueOperatingHoursMapper) {
        this.venueOperatingHoursRepository = venueOperatingHoursRepository;
        this.venueOperatingHoursMapper = venueOperatingHoursMapper;
    }

    public List<VenueOperatingHoursResponse> findAllVenueOperatingHours() {
        return venueOperatingHoursRepository.findAllWithVenue()
                .stream()
                .map(venueOperatingHoursMapper::toResponse)
                .toList();
    }

    @Cacheable(value="venueOperatingHours", key="#venueId")
    public VenueOperatingHoursResponse findByVenueId(UUID venueId) {
        return venueOperatingHoursRepository.findByVenue_Id(venueId)
                .map(venueOperatingHoursMapper::toResponse)
                .orElseThrow(() -> new VenueOperatingHoursNotFoundException("Operating hours not found for venue: " + venueId));
    }

    public VenueOperatingHoursResponse findVenueOperatingHoursById(UUID id){
        VenueOperatingHours response = venueOperatingHoursRepository.findById(id).orElseThrow(
                () -> new VenueOperatingHoursNotFoundException("Venue Operating Hours does not exist"));

        return venueOperatingHoursMapper.toResponse(response);

    }

    @CacheEvict(value="venueOperatingHours", key="#dto.venueId")
    public VenueOperatingHoursResponse createVenueOperatingHours(CreateVenueOperatingHoursRequest dto){
        VenueOperatingHours createdVenueOperatingHours = venueOperatingHoursMapper.toEntity(dto);
        VenueOperatingHours savedVenueOperatingHours = venueOperatingHoursRepository.save(createdVenueOperatingHours);

        return venueOperatingHoursMapper.toResponse(savedVenueOperatingHours);

    }

    @CacheEvict(value="venueOperatingHours", key="#dto.venueId")
    public VenueOperatingHoursResponse updateVenueOperatingHours(UpdateVenueOperatingHoursRequest dto, UUID id){
        VenueOperatingHours venueOperatingHours = venueOperatingHoursRepository.findById(id).orElseThrow(
                () -> new VenueOperatingHoursNotFoundException("Venue Operating Hours does not exist"));

        venueOperatingHoursMapper.updateEntity(dto, venueOperatingHours);
        VenueOperatingHours updatedVenueOperatingHours = venueOperatingHoursRepository.save(venueOperatingHours);

        return venueOperatingHoursMapper.toResponse(updatedVenueOperatingHours);

    }

    @CacheEvict(value="venueOperatingHours", key="#dto.venueId")
    public void deleteVenueOperatingHours(UUID id){
        if(!venueOperatingHoursRepository.existsById(id)){
            throw new VenueOperatingHoursNotFoundException("Venue Operating Hours does not exist");
        }
        venueOperatingHoursRepository.deleteById(id);

    }

}
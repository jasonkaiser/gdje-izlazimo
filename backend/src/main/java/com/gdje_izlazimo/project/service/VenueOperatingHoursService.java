package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueOperatingHoursRequest;
import com.gdje_izlazimo.project.dto.response.VenueOperatingHoursResponse;
import com.gdje_izlazimo.project.entity.VenueOperatingHours;
import com.gdje_izlazimo.project.mapper.VenueOperatingHoursMapper;
import com.gdje_izlazimo.project.repository.VenueOperatingHoursRepository;
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

    public List<VenueOperatingHoursResponse> findAllVenueOperatingHours(){

        List<VenueOperatingHours> responses = venueOperatingHoursRepository.findAll();

        return responses.stream()
                .map(venueOperatingHoursMapper::toResponse)
                .toList();

    }

    public VenueOperatingHoursResponse findVenueOperatingHoursById(UUID id){

        VenueOperatingHours response = venueOperatingHoursRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Operating Hours does not exist"));

        return venueOperatingHoursMapper.toResponse(response);

    }

    public VenueOperatingHoursResponse createVenueOperatingHours(CreateVenueOperatingHoursRequest dto){

        VenueOperatingHours createdVenueOperatingHours = venueOperatingHoursMapper.toEntity(dto);
        VenueOperatingHours savedVenueOperatingHours = venueOperatingHoursRepository.save(createdVenueOperatingHours);

        return venueOperatingHoursMapper.toResponse(savedVenueOperatingHours);

    }

    public VenueOperatingHoursResponse updateVenueOperatingHours(UpdateVenueOperatingHoursRequest dto, UUID id){

        VenueOperatingHours venueOperatingHours = venueOperatingHoursRepository.findById(id).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Operating Hours does not exist"));

        venueOperatingHoursMapper.updateEntity(dto, venueOperatingHours);
        VenueOperatingHours updatedVenueOperatingHours = venueOperatingHoursRepository.save(venueOperatingHours);

        return venueOperatingHoursMapper.toResponse(updatedVenueOperatingHours);

    }

    public void deleteVenueOperatingHours(UUID id){

        if(!venueOperatingHoursRepository.existsById(id)){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Venue Operating Hours does not exist");
        }
        venueOperatingHoursRepository.deleteById(id);

    }

}
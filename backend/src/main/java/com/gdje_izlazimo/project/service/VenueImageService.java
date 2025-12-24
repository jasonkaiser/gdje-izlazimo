package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueImageRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.entity.VenueImage;
import com.gdje_izlazimo.project.exception.custom.VenueImageNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueImageMapper;
import com.gdje_izlazimo.project.repository.VenueImageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class VenueImageService {

    private final VenueImageRepository venueImageRepository;
    private final VenueImageMapper venueImageMapper;

    public VenueImageService(VenueImageRepository venueImageRepository, VenueImageMapper venueImageMapper) {
        this.venueImageRepository = venueImageRepository;
        this.venueImageMapper = venueImageMapper;
    }

    public List<VenueImageResponse> findAllVenueImages(){

        List<VenueImage> responses = venueImageRepository.findAll();

        return responses.stream()
                .map(venueImageMapper::toResponse)
                .toList();

    }

    public VenueImageResponse findVenueImageById(UUID id){

        VenueImage response = venueImageRepository.findById(id).orElseThrow(
                () -> new VenueImageNotFoundException("Venue Image does not exist"));

        return venueImageMapper.toResponse(response);

    }

    public VenueImageResponse createVenueImage(CreateVenueImageRequest dto){

        VenueImage createdVenueImage = venueImageMapper.toEntity(dto);
        VenueImage savedVenueImage = venueImageRepository.save(createdVenueImage);

        return venueImageMapper.toResponse(savedVenueImage);

    }

    public VenueImageResponse updateVenueImage(UpdateVenueImageRequest dto, UUID id){

        VenueImage venueImage = venueImageRepository.findById(id).orElseThrow(
                () -> new VenueImageNotFoundException("Venue Image does not exist"));

        venueImageMapper.updateEntity(dto, venueImage);
        VenueImage updatedVenueImage = venueImageRepository.save(venueImage);

        return venueImageMapper.toResponse(updatedVenueImage);

    }

    public void deleteVenueImage(UUID id){

        if(!venueImageRepository.existsById(id)){
            throw new VenueImageNotFoundException("Venue Image does not exist");
        }
        venueImageRepository.deleteById(id);

    }

}
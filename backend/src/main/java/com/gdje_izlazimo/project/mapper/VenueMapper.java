package com.gdje_izlazimo.project.mapper;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class VenueMapper {

    private final UserRepository userRepository;

    @Autowired
    public VenueMapper(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Venue toEntity(CreateVenueRequest dto){
        Venue venue = new Venue();
        venue.setName(dto.name());
        venue.setDescription(dto.description());
        venue.setAddressName(dto.addressName());
        venue.setActive(dto.isActive());
        venue.setVenueType(dto.venueType());
        venue.setPhone(dto.phone());
        venue.setLatitude(dto.latitude());
        venue.setLongitude(dto.longitude());

        User owner = userRepository.findById(dto.venueOwnerId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        venue.setVenueOwner(owner);

        return venue;
    }

    public void updateEntity(Venue venue, UpdateVenueRequest dto){
        venue.setName(dto.name());
        venue.setDescription(dto.description());
        venue.setActive(dto.isActive());
        venue.setVenueType(dto.venueType());
        venue.setPhone(dto.phone());
    }

    public VenueResponse toResponse(Venue venue){
        return new VenueResponse(
                venue.getId(),
                venue.getName(),
                venue.getDescription(),
                venue.getAddressName(),
                venue.isActive(),
                venue.getVenueType(),
                venue.getPhone(),
                venue.getLatitude(),
                venue.getLongitude(),
                venue.getCreated_at(),
                venue.getUpdated_at());
    }
}
package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.entity.VenueImage;
import com.gdje_izlazimo.project.exception.custom.VenueImageNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueImageMapper;
import com.gdje_izlazimo.project.repository.VenueImageRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VenueImageService {

    private final VenueImageRepository venueImageRepository;
    private final VenueImageMapper venueImageMapper;
    private final ImageKitService imageKitService;
    private final VenueRepository venueRepository;

    @Lazy
    @Autowired
    private VenueImageService self;

    @Transactional(readOnly = true)
    public List<VenueImageResponse> findAllVenueImages() {
        return venueImageRepository.findAll()
                .stream()
                .map(venueImageMapper::toResponse)
                .toList();
    }
    @Transactional(readOnly = true)
    public List<VenueImageResponse> findByVenueId(UUID venueId) {
        return venueImageRepository.findByVenue_Id(venueId)
                .stream()
                .map(venueImageMapper::toResponse)
                .toList();
    }
    @Transactional(readOnly = true)
    public VenueImageResponse findVenueImageById(UUID id) {
        VenueImage venueImage = venueImageRepository.findById(id)
                .orElseThrow(() -> new VenueImageNotFoundException("Venue Image does not exist"));
        return venueImageMapper.toResponse(venueImage);
    }
    public VenueImageResponse uploadVenueImage(UUID venueId, MultipartFile file, boolean isPrimary) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));


        String[] uploadResult = imageKitService.uploadImage(file, "venues/" + venueId);

        return self.saveVenueImage(venue, uploadResult[0], uploadResult[1], isPrimary);

    }

    @Transactional
    public VenueImageResponse saveVenueImage(Venue venue, String imageUrl, String fileId, boolean isPrimary){
        if (isPrimary) {
            venueImageRepository.findByVenue_IdAndIsPrimaryTrue(venue.getId())
                    .ifPresent(existing -> {
                        existing.setPrimary(false);
                        venueImageRepository.save(existing);
                    });
        }

        VenueImage venueImage = new VenueImage();
        venueImage.setVenue(venue);
        venueImage.setImageUrl(imageUrl);
        venueImage.setImageKitFileId(fileId);
        venueImage.setPrimary(isPrimary);

        return venueImageMapper.toResponse(venueImageRepository.save(venueImage));
    }

    @Transactional
    public VenueImageResponse updateVenueImage(UpdateVenueImageRequest dto, UUID id) {
        VenueImage venueImage = venueImageRepository.findById(id)
                .orElseThrow(() -> new VenueImageNotFoundException("Venue Image does not exist"));
        venueImageMapper.updateEntity(dto, venueImage);
        return venueImageMapper.toResponse(venueImageRepository.save(venueImage));
    }

    @Transactional
    public void deleteVenueImage(UUID id) {
        VenueImage venueImage = venueImageRepository.findById(id)
                .orElseThrow(() -> new VenueImageNotFoundException("Venue Image does not exist"));

        venueImageRepository.deleteById(id);
        imageKitService.deleteImage(venueImage.getImageKitFileId());
    }
}
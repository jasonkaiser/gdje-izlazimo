package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.update.UpdateVenueImageRequest;
import com.gdje_izlazimo.project.dto.response.VenueImageResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.entity.VenueImage;
import com.gdje_izlazimo.project.exception.custom.VenueImageNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueImageMapper;
import com.gdje_izlazimo.project.repository.VenueImageRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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

    @Transactional(readOnly = true)
    public List<VenueImageResponse> findAllVenueImages() {
        return venueImageRepository.findAllWithVenue()
                .stream()
                .map(venueImageMapper::toResponse)
                .toList();
    }

    @Cacheable(value = "venueImages", key = "#venueId")
    @Transactional(readOnly = true)
    public List<VenueImageResponse> findByVenue(UUID venueId) {
        return venueImageRepository.findByVenueIdWithVenue(venueId)
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

    @CacheEvict(value = "venueImages", key = "#venueId")
    @Transactional
    public VenueImageResponse uploadVenueImage(UUID venueId, MultipartFile file, boolean isPrimary) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));

        if (isPrimary) {
            venueImageRepository.findByVenue_IdAndPrimaryTrue(venueId)
                    .ifPresent(existing -> {
                        existing.setPrimary(false);
                        venueImageRepository.save(existing);
                    });
        }

        String[] uploadResult = imageKitService.uploadImage(file, "venues/" + venueId);

        VenueImage venueImage = new VenueImage();
        venueImage.setVenue(venue);
        venueImage.setImageUrl(uploadResult[0]);
        venueImage.setImageKitFileId(uploadResult[1]);
        venueImage.setPrimary(isPrimary);

        return venueImageMapper.toResponse(venueImageRepository.save(venueImage));
    }

    @CacheEvict(value = "venueImages", allEntries = true)
    @Transactional
    public VenueImageResponse updateVenueImage(UpdateVenueImageRequest dto, UUID id) {
        VenueImage venueImage = venueImageRepository.findById(id)
                .orElseThrow(() -> new VenueImageNotFoundException("Venue Image does not exist"));
        venueImageMapper.updateEntity(dto, venueImage);
        return venueImageMapper.toResponse(venueImageRepository.save(venueImage));
    }

    @CacheEvict(value = "venueImages", allEntries = true)
    @Transactional
    public void deleteVenueImage(UUID id) {
        VenueImage venueImage = venueImageRepository.findById(id)
                .orElseThrow(() -> new VenueImageNotFoundException("Venue Image does not exist"));
        venueImageRepository.deleteById(id);
        imageKitService.deleteImage(venueImage.getImageKitFileId());
    }
}
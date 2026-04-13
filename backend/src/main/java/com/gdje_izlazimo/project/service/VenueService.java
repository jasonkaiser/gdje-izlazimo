package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.request.update.UpdateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.VenueKind;
import com.gdje_izlazimo.project.exception.custom.VenueAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.VenueNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueMapper;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final VenueMapper venueMapper;

    public VenueService(VenueRepository venueRepository, VenueMapper venueMapper) {
        this.venueRepository = venueRepository;
        this.venueMapper = venueMapper;
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> findAllVenues(Pageable pageable) {
        return fetchPage(null, null, null, pageable);
    }

    @Cacheable(value = "venueById", key = "#id")
    @Transactional(readOnly = true)
    public VenueResponse findVenueById(UUID id) {
        Venue venue = venueRepository.findByIdWithImages(id)
                .orElseThrow(() -> new VenueNotFoundException("Venue does not exist"));
        return venueMapper.toResponse(venue);
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> findByVenueType(Pageable pageable, VenueCategory venueType) {
        return fetchPage(null, venueType, null, pageable);
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> findByVenueKind(Pageable pageable, VenueKind venueKind) {
        return fetchPage(null, null, venueKind, pageable);
    }

    @Transactional(readOnly = true)
    public VenueResponse getVenueByOwnerId(UUID ownerId) {
        Venue venue = venueRepository.findByVenueOwner_Id(ownerId)
                .orElseThrow(() -> new VenueNotFoundException("Venue not found for owner: " + ownerId));
        return venueMapper.toResponse(venue);
    }

    @Transactional(readOnly = true)
    public List<VenueResponse> searchVenues(String query, VenueCategory category, VenueKind venueKind, Pageable pageable) {
        String normalizedQuery = (query == null || query.isBlank()) ? null : query;
        return fetchPage(normalizedQuery, category, venueKind, pageable);
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "venueTypeBreakdown", "topVenues"}, allEntries = true)
    public VenueResponse createVenue(CreateVenueRequest dto) {
        if (venueRepository.existsByName(dto.name())) {
            throw new VenueAlreadyExistsException("Venue with this name already exists");
        }
        Venue newVenue = venueMapper.toEntity(dto);
        Venue savedVenue = venueRepository.save(newVenue);
        return venueMapper.toResponse(savedVenue);
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "venueTypeBreakdown", "topVenues", "venueById"}, allEntries = true)
    public VenueResponse updateVenue(UpdateVenueRequest dto, UUID id) {
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new VenueNotFoundException("Venue does not exist"));
        venueMapper.updateEntity(dto, venue);
        Venue updatedVenue = venueRepository.save(venue);
        return venueMapper.toResponse(updatedVenue);
    }

    @Transactional
    @CacheEvict(value = {"dashboardStats", "venueTypeBreakdown", "topVenues", "venueById"}, allEntries = true)
    public void deleteVenue(UUID id) {
        if (!venueRepository.existsById(id)) {
            throw new VenueNotFoundException("Venue does not exist");
        }
        venueRepository.deleteById(id);
    }

    public void assertVenueAcceptsReservations(Venue venue) {
        if (venue.getVenueKind() != VenueKind.PARTNER) {
            throw new IllegalStateException("This venue does not accept reservations");
        }
    }

    private List<VenueResponse> fetchPage(String query, VenueCategory category, VenueKind venueKind, Pageable pageable) {
        Page<UUID> idPage = venueRepository.findIdsBySearchCriteria(query, category, venueKind, pageable);

        if (idPage.isEmpty()) return List.of();

        List<Venue> venues = venueRepository.findByIdsWithImages(idPage.getContent());

        return idPage.getContent().stream()
                .map(id -> venues.stream()
                        .filter(v -> v.getId().equals(id))
                        .findFirst()
                        .orElseThrow())
                .map(venueMapper::toResponse)
                .toList();
    }
}
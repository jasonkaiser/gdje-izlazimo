package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.request.create.CreateVenueRequest;
import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.VenueKind;
import com.gdje_izlazimo.project.exception.custom.VenueAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.VenueNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueMapper;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private VenueService venueService;

    private Venue venue;
    private VenueResponse venueResponse;
    private UUID venueId;
    private UUID ownerId;

    @BeforeEach
    void setUp() {
        venueId = UUID.randomUUID();
        ownerId = UUID.randomUUID();

        User owner = new User();
        owner.setId(ownerId);
        owner.setRole(Role.VENUE_OWNER);

        venue = new Venue();
        venue.setId(venueId);
        venue.setName("Club Atmosphere");
        venue.setDescription("Popular nightclub in the city center");
        venue.setAddressName("Ferhadija 12, Sarajevo");
        venue.setVenueType(VenueCategory.CLUB);
        venue.setVenueKind(VenueKind.PARTNER);
        venue.setActive(true);
        venue.setPhone("+38733000000");
        venue.setLatitude(43.8476);
        venue.setLongitude(18.3564);
        venue.setVenueOwner(owner);

        venueResponse = new VenueResponse(
                venueId,
                "Club Atmosphere",
                "Popular nightclub in the city center",
                "Ferhadija 12, Sarajevo",
                true,
                VenueCategory.CLUB,
                VenueKind.PARTNER,
                "+38733000000",
                43.8476,
                18.3564,
                LocalDateTime.now(),
                LocalDateTime.now(),
                List.of()
        );
    }

    @Test
    void shouldReturnVenueById() {
        when(venueRepository.findByIdWithImages(venueId)).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        VenueResponse result = venueService.findVenueById(venueId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(venueId);
        assertThat(result.name()).isEqualTo("Club Atmosphere");
        assertThat(result.venueType()).isEqualTo(VenueCategory.CLUB);
        assertThat(result.venueKind()).isEqualTo(VenueKind.PARTNER);
    }

    @Test
    void shouldThrowWhenVenueNotFoundById() {
        UUID unknownId = UUID.randomUUID();
        when(venueRepository.findByIdWithImages(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> venueService.findVenueById(unknownId))
                .isInstanceOf(VenueNotFoundException.class)
                .hasMessageContaining("Venue does not exist");
    }

    @Test
    void shouldReturnAllVenues() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<UUID> idPage = new PageImpl<>(List.of(venueId));

        when(venueRepository.findIdsBySearchCriteria(null, null, null, pageable)).thenReturn(idPage);
        when(venueRepository.findByIdsWithImages(List.of(venueId))).thenReturn(List.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        List<VenueResponse> result = venueService.findAllVenues(pageable);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Club Atmosphere");
    }

    @Test
    void shouldReturnEmptyListWhenNoVenuesFound() {
        Pageable pageable = PageRequest.of(0, 10);
        when(venueRepository.findIdsBySearchCriteria(null, null, null, pageable))
                .thenReturn(Page.empty());

        List<VenueResponse> result = venueService.findAllVenues(pageable);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldReturnFilteredVenuesByNameAndCategory() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<UUID> idPage = new PageImpl<>(List.of(venueId));

        when(venueRepository.findIdsBySearchCriteria("Atmosphere", VenueCategory.CLUB, null, pageable))
                .thenReturn(idPage);
        when(venueRepository.findByIdsWithImages(List.of(venueId))).thenReturn(List.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        List<VenueResponse> result = venueService.searchVenues("Atmosphere", VenueCategory.CLUB, null, pageable);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).venueType()).isEqualTo(VenueCategory.CLUB);
    }

    @Test
    void shouldReturnFilteredVenuesByKind() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<UUID> idPage = new PageImpl<>(List.of(venueId));

        when(venueRepository.findIdsBySearchCriteria(null, null, VenueKind.LISTED, pageable))
                .thenReturn(idPage);
        when(venueRepository.findByIdsWithImages(List.of(venueId))).thenReturn(List.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        List<VenueResponse> result = venueService.searchVenues(null, null, VenueKind.LISTED, pageable);

        assertThat(result).hasSize(1);
    }

    @Test
    void shouldTreatBlankQueryAsNull() {
        Pageable pageable = PageRequest.of(0, 10);
        when(venueRepository.findIdsBySearchCriteria(null, null, null, pageable))
                .thenReturn(Page.empty());

        List<VenueResponse> result = venueService.searchVenues("   ", null, null, pageable);

        assertThat(result).isEmpty();
        verify(venueRepository).findIdsBySearchCriteria(null, null, null, pageable);
    }

    @Test
    void shouldReturnVenueByOwnerId() {
        when(venueRepository.findByVenueOwner_Id(ownerId)).thenReturn(Optional.of(venue));
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        VenueResponse result = venueService.getVenueByOwnerId(ownerId);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(venueId);
    }

    @Test
    void shouldThrowWhenNoVenueFoundForOwner() {
        UUID unknownOwnerId = UUID.randomUUID();
        when(venueRepository.findByVenueOwner_Id(unknownOwnerId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> venueService.getVenueByOwnerId(unknownOwnerId))
                .isInstanceOf(VenueNotFoundException.class)
                .hasMessageContaining("Venue not found for owner");
    }

    @Test
    void shouldCreateVenueSuccessfully() {
        CreateVenueRequest dto = new CreateVenueRequest(
                "Club Atmosphere",
                "Description",
                "Ferhadija 12, Sarajevo",
                true,
                VenueCategory.CLUB,
                VenueKind.PARTNER,
                "+38733000000",
                43.8476,
                18.3564,
                ownerId
        );

        when(venueRepository.existsByName("Club Atmosphere")).thenReturn(false);
        when(venueMapper.toEntity(dto)).thenReturn(venue);
        when(venueRepository.save(venue)).thenReturn(venue);
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        VenueResponse result = venueService.createVenue(dto);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Club Atmosphere");
        assertThat(result.venueKind()).isEqualTo(VenueKind.PARTNER);
        verify(venueRepository, times(1)).save(venue);
    }

    @Test
    void shouldThrowWhenVenueWithSameNameAlreadyExists() {
        CreateVenueRequest dto = new CreateVenueRequest(
                "Club Atmosphere",
                "Description",
                "Ferhadija 12, Sarajevo",
                true,
                VenueCategory.CLUB,
                VenueKind.PARTNER,
                "+38733000000",
                43.8476,
                18.3564,
                ownerId
        );

        when(venueRepository.existsByName("Club Atmosphere")).thenReturn(true);

        assertThatThrownBy(() -> venueService.createVenue(dto))
                .isInstanceOf(VenueAlreadyExistsException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void shouldThrowWhenCreatingReservationForListedVenue() {
        venue.setVenueKind(VenueKind.LISTED);

        assertThatThrownBy(() -> venueService.assertVenueAcceptsReservations(venue))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("does not accept reservations");
    }

    @Test
    void shouldNotThrowWhenCreatingReservationForPartnerVenue() {
        venue.setVenueKind(VenueKind.PARTNER);

        org.junit.jupiter.api.Assertions.assertDoesNotThrow(
                () -> venueService.assertVenueAcceptsReservations(venue)
        );
    }

    @Test
    void shouldDeleteVenueSuccessfully() {
        when(venueRepository.existsById(venueId)).thenReturn(true);

        venueService.deleteVenue(venueId);

        verify(venueRepository, times(1)).deleteById(venueId);
    }

    @Test
    void shouldThrowWhenDeletingNonExistentVenue() {
        UUID unknownId = UUID.randomUUID();
        when(venueRepository.existsById(unknownId)).thenReturn(false);

        assertThatThrownBy(() -> venueService.deleteVenue(unknownId))
                .isInstanceOf(VenueNotFoundException.class)
                .hasMessageContaining("Venue does not exist");
    }
}
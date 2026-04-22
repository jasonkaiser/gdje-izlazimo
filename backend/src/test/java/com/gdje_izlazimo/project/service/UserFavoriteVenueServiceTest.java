package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.response.VenueResponse;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.UserFavoriteVenue;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.enums.Role;
import com.gdje_izlazimo.project.enums.VenueCategory;
import com.gdje_izlazimo.project.enums.VenueKind;
import com.gdje_izlazimo.project.exception.custom.FavoriteAlreadyExistsException;
import com.gdje_izlazimo.project.exception.custom.FavoriteNotFoundException;
import com.gdje_izlazimo.project.exception.custom.UserNotFoundException;
import com.gdje_izlazimo.project.exception.custom.VenueNotFoundException;
import com.gdje_izlazimo.project.mapper.VenueMapper;
import com.gdje_izlazimo.project.repository.UserFavoriteVenueRepository;
import com.gdje_izlazimo.project.repository.UserRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserFavoriteVenueServiceTest {

    @Mock
    private UserFavoriteVenueRepository favoriteRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private VenueMapper venueMapper;

    @InjectMocks
    private UserFavoriteVenueService userFavoriteVenueService;

    private User user;
    private Venue venue;
    private VenueResponse venueResponse;
    private UUID userId;
    private UUID venueId;

    @BeforeEach
    void setUp() {
        userId  = UUID.randomUUID();
        venueId = UUID.randomUUID();

        user = new User();
        user.setId(userId);
        user.setEmail("user@test.com");
        user.setName("Test User");
        user.setRole(Role.USER);

        venue = new Venue();
        venue.setId(venueId);
        venue.setName("Club Atmosphere");
        venue.setAddressName("Ferhadija 12, Sarajevo");
        venue.setVenueType(VenueCategory.CLUB);
        venue.setActive(true);

        venueResponse = new VenueResponse(
                venueId, "Club Atmosphere", "Description",
                "Ferhadija 12, Sarajevo", true,
                VenueCategory.CLUB, VenueKind.PARTNER, "+38733000000",
                "https://www.instagram.com/gdjeizlazimo/",
                43.8476, 18.3564,
                LocalDateTime.now(), LocalDateTime.now(),
                List.of(), 2.0,4
        );
    }


    @Test
    void shouldAddVenueToFavoritesSuccessfully() {
        when(favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(venueRepository.findById(venueId)).thenReturn(Optional.of(venue));

        userFavoriteVenueService.addFavorite(userId, venueId);

        verify(favoriteRepository, times(1)).save(any(UserFavoriteVenue.class));
    }

    @Test
    void shouldThrowWhenVenueAlreadyInFavorites() {
        when(favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)).thenReturn(true);

        assertThatThrownBy(() -> userFavoriteVenueService.addFavorite(userId, venueId))
                .isInstanceOf(FavoriteAlreadyExistsException.class)
                .hasMessageContaining("already in your favorites");
    }

    @Test
    void shouldThrowWhenUserNotFoundOnAddFavorite() {
        when(favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userFavoriteVenueService.addFavorite(userId, venueId))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void shouldThrowWhenVenueNotFoundOnAddFavorite() {
        when(favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)).thenReturn(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(venueRepository.findById(venueId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userFavoriteVenueService.addFavorite(userId, venueId))
                .isInstanceOf(VenueNotFoundException.class)
                .hasMessageContaining("Venue not found");
    }



    @Test
    void shouldRemoveVenueFromFavoritesSuccessfully() {
        when(favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)).thenReturn(true);

        userFavoriteVenueService.removeFavorite(userId, venueId);

        verify(favoriteRepository, times(1)).deleteByUser_IdAndVenue_Id(userId, venueId);
    }

    @Test
    void shouldThrowWhenVenueNotInFavoritesOnRemove() {
        when(favoriteRepository.existsByUser_IdAndVenue_Id(userId, venueId)).thenReturn(false);

        assertThatThrownBy(() -> userFavoriteVenueService.removeFavorite(userId, venueId))
                .isInstanceOf(FavoriteNotFoundException.class)
                .hasMessageContaining("not in your favorites");
    }


    @Test
    void shouldReturnFavoritesForUser() {
        UserFavoriteVenue favorite = new UserFavoriteVenue();
        favorite.setUser(user);
        favorite.setVenue(venue);

        when(userRepository.existsById(userId)).thenReturn(true);
        when(favoriteRepository.findByUser_Id(userId)).thenReturn(List.of(favorite));
        when(venueMapper.toResponse(venue)).thenReturn(venueResponse);

        List<VenueResponse> result = userFavoriteVenueService.getFavorites(userId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("Club Atmosphere");
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoFavorites() {
        when(userRepository.existsById(userId)).thenReturn(true);
        when(favoriteRepository.findByUser_Id(userId)).thenReturn(List.of());

        List<VenueResponse> result = userFavoriteVenueService.getFavorites(userId);

        assertThat(result).isEmpty();
    }

    @Test
    void shouldThrowWhenUserNotFoundOnGetFavorites() {
        when(userRepository.existsById(userId)).thenReturn(false);

        assertThatThrownBy(() -> userFavoriteVenueService.getFavorites(userId))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("User not found");
    }
}
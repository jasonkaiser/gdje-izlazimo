package com.gdje_izlazimo.project.mapper.helper;

import com.gdje_izlazimo.project.entity.TableType;
import com.gdje_izlazimo.project.entity.User;
import com.gdje_izlazimo.project.entity.Venue;
import com.gdje_izlazimo.project.entity.Reservation;
import com.gdje_izlazimo.project.repository.TableTypeRepository;
import com.gdje_izlazimo.project.repository.UserRepository;
import com.gdje_izlazimo.project.repository.VenueRepository;
import com.gdje_izlazimo.project.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.mapstruct.Named;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SharedMapperHelper {

    private final VenueRepository venueRepository;
    private final TableTypeRepository tableTypeRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservationRepository;

    @Named("resolveVenue")
    public Venue resolveVenue(UUID venueId) {
        return venueRepository.findById(venueId)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    @Named("resolveTableType")
    public TableType resolveTableType(UUID tableTypeId) {
        return tableTypeRepository.findById(tableTypeId)
                .orElseThrow(() -> new RuntimeException("Table Type not found"));
    }

    @Named("resolveUser")
    public User resolveUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Named("resolveReservation")
    public Reservation resolveReservation(UUID reservationId) {
        return reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }
}
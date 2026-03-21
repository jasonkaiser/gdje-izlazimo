package com.gdje_izlazimo.project.service;

import com.gdje_izlazimo.project.dto.response.*;
import com.gdje_izlazimo.project.enums.Status;
import com.gdje_izlazimo.project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final ReservationRepository reservationRepository;
    private final TableTypeRepository tableTypeRepository;


    @Cacheable(value = "dashboardStats", unless = "#result == null")
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        log.debug("Fetching dashboard stats from database");

        return new DashboardStatsResponse(
                userRepository.count(),
                venueRepository.countByActive(true),
                venueRepository.countByActive(false),
                reservationRepository.count(),
                reservationRepository.countByStatus(Status.PENDING),
                reservationRepository.countByStatus(Status.ACCEPTED),
                reservationRepository.countByStatus(Status.REJECTED),
                reservationRepository.countByStatus(Status.CANCELLED),
                tableTypeRepository.count()
        );
    }


    @Cacheable(value = "venueTypeBreakdown", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<VenueTypeBreakdownResponse> getVenueTypeBreakdown() {
        log.debug("Fetching venue type breakdown");

        long totalVenues = venueRepository.count();
        if (totalVenues == 0) {
            return List.of();
        }

        return venueRepository.getVenueTypeBreakdown().stream()
                .map(breakdown -> new VenueTypeBreakdownResponse(
                        breakdown.getType(),
                        breakdown.getCount(),
                        (breakdown.getCount().doubleValue() / totalVenues) * 100.0
                ))
                .collect(Collectors.toList());
    }


    @Cacheable(value = "reservationStatusBreakdown", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<ReservationStatusBreakdownResponse> getReservationStatusBreakdown() {
        log.debug("Fetching reservation status breakdown");

        long totalReservations = reservationRepository.count();
        if (totalReservations == 0) {
            return List.of();
        }

        return reservationRepository.getReservationStatusBreakdown().stream()
                .map(breakdown -> new ReservationStatusBreakdownResponse(
                        breakdown.getStatus(),
                        breakdown.getCount(),
                        (breakdown.getCount().doubleValue() / totalReservations) * 100.0
                ))
                .collect(Collectors.toList());
    }


    @Cacheable(value = "topVenues", unless = "#result == null || #result.isEmpty()")
    @Transactional(readOnly = true)
    public List<TopVenueResponse> getTopVenuesByReservations(int limit) {
        log.debug("Fetching top {} venues by reservations", limit);

        return venueRepository.getTopVenuesByReservations().stream()
                .limit(limit)
                .map(projection -> new TopVenueResponse(
                        projection.getVenueId(),
                        projection.getVenueName(),
                        projection.getAddressName(),
                        projection.getVenueType(),
                        projection.getActive(),
                        projection.getReservationCount()
                ))
                .collect(Collectors.toList());
    }
}
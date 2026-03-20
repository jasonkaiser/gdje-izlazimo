package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.response.*;
import com.gdje_izlazimo.project.entity.ActivityLog;
import com.gdje_izlazimo.project.mapper.ActivityLogMapper;
import com.gdje_izlazimo.project.service.ActivityLogService;
import com.gdje_izlazimo.project.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('admin')")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ActivityLogService activityLogService;
    private final ActivityLogMapper activityLogMapper;


    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }


    @GetMapping("/venue-breakdown")
    public ResponseEntity<List<VenueTypeBreakdownResponse>> getVenueTypeBreakdown() {
        List<VenueTypeBreakdownResponse> breakdown = dashboardService.getVenueTypeBreakdown();
        return ResponseEntity.ok(breakdown);
    }


    @GetMapping("/reservation-breakdown")
    public ResponseEntity<List<ReservationStatusBreakdownResponse>> getReservationStatusBreakdown() {
        List<ReservationStatusBreakdownResponse> breakdown = dashboardService.getReservationStatusBreakdown();
        return ResponseEntity.ok(breakdown);
    }


    @GetMapping("/top-venues")
    public ResponseEntity<List<TopVenueResponse>> getTopVenues(
            @RequestParam(defaultValue = "5") int limit
    ) {
        List<TopVenueResponse> topVenues = dashboardService.getTopVenuesByReservations(limit);
        return ResponseEntity.ok(topVenues);
    }


    @GetMapping("/activities")
    public ResponseEntity<Page<ActivityLogResponse>> getRecentActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ActivityLog> activities = activityLogService.getRecentActivities(page, size);
        Page<ActivityLogResponse> response = activities.map(activityLogMapper::toResponse);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/activities/recent/{limit}")
    public ResponseEntity<List<ActivityLogResponse>> getTopRecentActivities(
            @PathVariable int limit
    ) {
        List<ActivityLog> activities = activityLogService.getTopRecentActivities(limit);
        List<ActivityLogResponse> response = activities.stream()
                .map(activityLogMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }
}
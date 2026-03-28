package com.gdje_izlazimo.project.controller;

import com.gdje_izlazimo.project.dto.response.*;
import com.gdje_izlazimo.project.entity.ActivityLog;
import com.gdje_izlazimo.project.mapper.ActivityLogMapper;
import com.gdje_izlazimo.project.service.ActivityLogService;
import com.gdje_izlazimo.project.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Dashboard", description = "Admin dashboard statistics and activity endpoints")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;
    private final ActivityLogService activityLogService;
    private final ActivityLogMapper activityLogMapper;

    @Operation(summary = "Get dashboard stats", description = "Returns overall platform statistics. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Stats retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    @Operation(summary = "Get venue type breakdown", description = "Returns a breakdown of venues by category. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Breakdown retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/venue-breakdown")
    public ResponseEntity<List<VenueTypeBreakdownResponse>> getVenueTypeBreakdown() {
        return ResponseEntity.ok(dashboardService.getVenueTypeBreakdown());
    }

    @Operation(summary = "Get reservation status breakdown", description = "Returns a breakdown of reservations by status. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Breakdown retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/reservation-breakdown")
    public ResponseEntity<List<ReservationStatusBreakdownResponse>> getReservationStatusBreakdown() {
        return ResponseEntity.ok(dashboardService.getReservationStatusBreakdown());
    }

    @Operation(summary = "Get top venues", description = "Returns the top N venues by number of reservations. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Top venues retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/top-venues")
    public ResponseEntity<List<TopVenueResponse>> getTopVenues(
            @Parameter(description = "Number of top venues to return") @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(dashboardService.getTopVenuesByReservations(limit));
    }

    @Operation(summary = "Get activity log (paginated)", description = "Returns a paginated list of recent platform activities. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Activities retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/activities")
    public ResponseEntity<Page<ActivityLogResponse>> getRecentActivities(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page") @RequestParam(defaultValue = "10") int size) {
        Page<ActivityLog> activities = activityLogService.getRecentActivities(page, size);
        return ResponseEntity.ok(activities.map(activityLogMapper::toResponse));
    }

    @Operation(summary = "Get top N recent activities", description = "Returns the most recent N activity log entries. Requires role: admin")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Activities retrieved successfully"),
            @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/activities/recent/{limit}")
    public ResponseEntity<List<ActivityLogResponse>> getTopRecentActivities(
            @Parameter(description = "Number of recent activities to return") @PathVariable int limit) {
        List<ActivityLog> activities = activityLogService.getTopRecentActivities(limit);
        List<ActivityLogResponse> response = activities.stream()
                .map(activityLogMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }
}
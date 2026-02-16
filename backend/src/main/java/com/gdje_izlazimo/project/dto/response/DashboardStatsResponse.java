package com.gdje_izlazimo.project.dto.response;

public record DashboardStatsResponse(
        Long totalUsers,
        Long activeVenues,
        Long inactiveVenues,
        Long totalReservations,
        Long pendingReservations,
        Long acceptedReservations,
        Long rejectedReservations,
        Long cancelledReservations,
        Long totalTableTypes
) {
}
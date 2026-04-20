package com.gdje_izlazimo.project.dto.response;

public record RatingStatsResponse(
        double averageRating,
        long totalRatings
) {
    public static final RatingStatsResponse EMPTY =
            new RatingStatsResponse(0.0, 0L);
}

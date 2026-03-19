// src/app/core/models/venue-images/venue-image-response.dto.ts
export interface VenueImageResponseDto {
  id: string;
  venueId: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}
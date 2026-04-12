export interface CreateRatingRequest {
  reservationId: string;
  venueId: string;
  userId?: string;
  rating: number;
  comment?: string;
}
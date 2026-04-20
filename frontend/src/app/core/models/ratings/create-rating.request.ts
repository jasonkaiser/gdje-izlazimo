export interface CreateRatingRequest {
  venueId: string;
  userId?: string;
  rating: number;
  comment?: string;
}
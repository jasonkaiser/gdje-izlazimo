export interface RatingResponseDto {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  profileImageUrl: string | null;
}
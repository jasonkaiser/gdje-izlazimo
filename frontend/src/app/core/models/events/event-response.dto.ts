export interface EventResponseDto {
  id: string;
  venueId: string;
  venueName: string;
  venueType: string;
  venueAddress: string;
  name: string;
  description: string;
  eventDateTime: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  trending: boolean;
}
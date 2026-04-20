export interface CreateEventDto {
  venueId: string;
  name: string;
  description?: string;
  eventDateTime: string;   
  imageUrl?: string;
}


import { VenueCategory } from "./venue-category.enum";


export interface VenueResponseDto {
  id: string;
  name: string;
  description: string;
  addressName: string;
  isActive: boolean;
  venueType: VenueCategory;
  phone: string;
  latitude: number;
  longitude: number;
  created_at: string;   
  updated_at: string;   
}

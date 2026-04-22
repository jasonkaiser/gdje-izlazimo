import { VenueCategory } from "./venue-category.enum";

export enum VenueKind {
  LISTED = 'LISTED',
  PARTNER = 'PARTNER',
}
export interface VenueImageDto {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VenueResponseDto {
  id: string;
  name: string;
  description: string;
  addressName: string;
  isActive: boolean;
  venueType: VenueCategory;
  venueKind: VenueKind;
  phone: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
  instagram?: string,
  images?: VenueImageDto[]; 
  averageRating: number;
  totalRatings: number;
}

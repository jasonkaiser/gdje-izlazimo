import { VenueCategory } from "./venue-category.enum";

export interface CreateVenueRequest {
    name: string, 
    description?: string,
    addressName: string,
    isActive: boolean,
    venueType: VenueCategory,
    phone: string,
    latitude: number, 
    longitude: number, 
    venueOwnerId: string

}
import { VenueCategory } from "./venue-category.enum";
import { VenueKind } from "./venue-response.dto";

export interface CreateVenueRequest {
    name: string, 
    description?: string,
    addressName: string,
    isActive: boolean,
    venueType: VenueCategory,
    venueKind: VenueKind,
    phone: string,
    latitude: number, 
    longitude: number, 
    venueOwnerId?: string

}
import { VenueCategory } from "./venue-category.enum";


export interface UpdateVenueRequest{
    name: string;
    description?: string;
    isActive: boolean;
    venueType: VenueCategory;
    phone: string;
    addressName: string;

}
import { VenueCategory } from "./venue-category.enum";
import { VenueKind } from "./venue-response.dto";


export interface UpdateVenueRequest{
    name: string;
    description?: string;
    isActive: boolean;
    venueType: VenueCategory;
    venueKind: VenueKind,
    phone: string;
    instagram?: string,
    addressName: string;

}
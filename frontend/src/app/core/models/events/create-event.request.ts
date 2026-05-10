import { EventTicketTypeDto } from './event-response.dto';

export interface EventTicketTypeRequest {
  name: string;
  description?: string;
  price?: number | null;
  currency?: string;
  purchaseUrl: string;
  displayOrder?: number;
  active?: boolean;
}

export interface CreateEventDto {
  venueId?: string | null;
  name: string;
  description?: string;
  eventDateTime: string;
  eventEndDateTime?: string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  eventType?: string | null;
  externalOrganizerName?: string | null;
  externalOrganizerInstagram?: string | null;
  featured?: boolean;
  imageUrl?: string;
  ticketTypes?: EventTicketTypeRequest[];
  latitude?: number | null;
  longitude?: number | null;
}
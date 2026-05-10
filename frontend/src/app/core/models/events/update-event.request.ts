import { EventTicketTypeRequest } from './create-event.request';

export interface UpdateEventDto {
  name?: string;
  description?: string;
  eventDateTime?: string;
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
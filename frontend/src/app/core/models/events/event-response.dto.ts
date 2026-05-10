export interface EventTicketTypeDto {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  purchaseUrl: string;
  displayOrder: number;
}

export interface EventResponseDto {
  id: string;
  venueId?: string | null;
  venueName?: string | null;
  venueType?: string | null;
  venueAddress?: string | null;
  locationName?: string | null;
  locationAddress?: string | null;
  eventType?: string | null;
  externalOrganizerName?: string | null;
  eventEndDateTime?: string | null;
  name: string;
  description?: string | null;
  eventDateTime: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  trending: boolean;
  featured?: boolean;
  ticketTypes?: EventTicketTypeDto[];
  hasTickets?: boolean;
  primaryTicketUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}
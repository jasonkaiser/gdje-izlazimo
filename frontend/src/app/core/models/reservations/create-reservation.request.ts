
export interface CreateReservationRequest {
  venueId: string;
  phone: string;
  reservationDate: string; 
  reservationTime: string; 
  tableTypeId: string;
  numberOfPeople: number;
  specialRequests?: string;
}

import { TableType } from '../table-types/table-type.enum';
import { ReservationStatus } from './reservation-status.enum';

export interface CreateReservationRequest {
  userId: string;
  venueId: string;
  phone: string;
  reservationDate: string; 
  reservationTime: string; 
  tableTypeId: string;
  numberOfPeople: number;
  status: ReservationStatus;
  specialRequests?: string;
}

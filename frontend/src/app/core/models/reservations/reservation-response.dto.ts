
import { ReservationStatus } from './reservation-status.enum';

export interface ReservationResponseDto {
  id: string;          
  userId: string;      
  venueId: string;    
  venueName: string;
  venueAddress: string;
  phone: string;
  reservationDate: string; 
  reservationTime: string;
  numberOfPeople: number;
  tableTypeId?: any;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;   
  updatedAt: string;  
}

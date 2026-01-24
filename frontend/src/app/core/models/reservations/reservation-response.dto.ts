
import { TableType } from '../table-types/table-type.enum';
import { ReservationStatus } from './reservation-status.enum';

export interface ReservationResponseDto {
  id: string;          
  userId: string;      
  venueId: string;    
  phone: string;
  reservationDate: string; 
  reservationTime: string;
  numberOfPeople: number;
  tableTypeId: string;
  status: ReservationStatus;
  specialRequests?: string;
  createdAt: string;   
  updatedAt: string;  
}

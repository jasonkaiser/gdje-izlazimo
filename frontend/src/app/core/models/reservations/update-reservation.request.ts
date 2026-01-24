import { ReservationStatus } from './reservation-status.enum';

export interface UpdateReservationRequest {
  status: ReservationStatus;
}

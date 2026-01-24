import { DayOfWeek } from './day-of-week.enum';

export interface CreateVenueOperatingHoursRequest {
  venueId: string;
  startDay: DayOfWeek;
  endDay: DayOfWeek;
  openTime: string;    
  closedTime: string;  
}

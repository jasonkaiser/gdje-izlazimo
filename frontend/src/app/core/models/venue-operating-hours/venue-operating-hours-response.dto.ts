import { DayOfWeek } from './day-of-week.enum';

export interface VenueOperatingHoursResponseDto {
  id: string;       
  venueId: string;  
  startDay: DayOfWeek;
  endDay: DayOfWeek;
  openTime: string;   
  closedTime: string;
  createdAt: string;  
  updatedAt: string;  
}

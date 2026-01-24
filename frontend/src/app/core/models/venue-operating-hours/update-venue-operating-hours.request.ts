import { DayOfWeek } from './day-of-week.enum';

export interface UpdateVenueOperatingHoursRequest {
  startDay: DayOfWeek;
  endDay: DayOfWeek;
  openTime: string;
  closedTime: string;
}

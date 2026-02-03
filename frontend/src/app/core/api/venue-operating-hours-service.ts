import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VenueOperatingHoursResponseDto } from '../models/venue-operating-hours/venue-operating-hours-response.dto';
import { CreateVenueOperatingHoursRequest } from '../models/venue-operating-hours/create-venue-operating-hours.request';

@Injectable({ providedIn: 'root' })
export class VenueOperatingHoursService {
  private baseUrl = `${environment.apiUrl}/venue/operating-hours`;

  constructor(private http: HttpClient) {}

  getAllVenueOperatingHours() {
    return this.http.get<VenueOperatingHoursResponseDto[]>(this.baseUrl);
  }

  getVenueOperatingHoursById(id: string) {
    return this.http.get<VenueOperatingHoursResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByVenueId(venueId: string) {
    return this.http.get<VenueOperatingHoursResponseDto>(`${this.baseUrl}/venue/${venueId}`);
  }

  createVenueOperatingHours(request: CreateVenueOperatingHoursRequest) {
    return this.http.post<VenueOperatingHoursResponseDto>(this.baseUrl, request);
  }

  deleteVenueOperatingHours(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

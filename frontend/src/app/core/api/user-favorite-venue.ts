import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VenueResponseDto } from '../models/venues/venue-response.dto';

@Injectable({ providedIn: 'root' })
export class UserFavoriteVenueService {
  private baseUrl = `${environment.apiUrl}/venues/favorites`;

  constructor(private http: HttpClient) {}

  getFavorites() {
    return this.http.get<VenueResponseDto[]>(this.baseUrl);
  }

  addFavorite(venueId: string) {
    return this.http.post<void>(`${this.baseUrl}/${venueId}`, {});
  }

  removeFavorite(venueId: string) {
    return this.http.delete<void>(`${this.baseUrl}/${venueId}`);
  }
}
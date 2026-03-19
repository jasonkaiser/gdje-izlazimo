import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VenueImageResponseDto } from '../models/venue-images/venue-image-response';

@Injectable({
  providedIn: 'root',
})
export class VenueImageService {

  private baseUrl = `${environment.apiUrl}/venue-images`;

  constructor(private http: HttpClient) {}

  getAllVenueImages() {
    return this.http.get<VenueImageResponseDto[]>(this.baseUrl);
  }

  getVenueImageById(id: string) {
    return this.http.get<VenueImageResponseDto>(`${this.baseUrl}/${id}`);
  }

  getByVenueId(venueId: string) {
    return this.http.get<VenueImageResponseDto[]>(`${this.baseUrl}/venue/${venueId}`);
  }

  uploadVenueImage(venueId: string, file: File, isPrimary: boolean = false) {
    const formData = new FormData();
    formData.append('venueId', venueId);
    formData.append('file', file);
    formData.append('isPrimary', String(isPrimary));
    return this.http.post<VenueImageResponseDto>(`${this.baseUrl}/upload`, formData);
  }

  setPrimaryImage(imageId: string) {
    return this.http.put<VenueImageResponseDto>(`${this.baseUrl}/${imageId}`, {
      isPrimary: true
    });
  }

  deleteVenueImage(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
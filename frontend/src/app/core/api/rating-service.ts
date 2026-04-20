import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RatingResponseDto } from '../models/ratings/rating-response.dto';
import { VenueRatingStatsDto } from '../models/ratings/venue-rating-response.dto';
import { CreateRatingRequest } from '../models/ratings/create-rating.request';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/ratings`;

  getByVenueId(venueId: string): Observable<RatingResponseDto[]> {
    return this.http.get<RatingResponseDto[]>(`${this.base}/venue/${venueId}`);
  }

  getVenueStats(venueId: string): Observable<VenueRatingStatsDto> {
    return this.http.get<VenueRatingStatsDto>(`${this.base}/venue/${venueId}/stats`);
  }

  createRating(request: CreateRatingRequest): Observable<RatingResponseDto> {
    return this.http.post<RatingResponseDto>(this.base, request);
  }

  hasRated(venueId: string, userId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.base}/exists`, {
      params: { venueId, userId }
    });
  }
}
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ReservationResponseDto } from '../models/reservations/reservation-response.dto';
import { CreateReservationRequest } from '../models/reservations/create-reservation.request';
import { UpdateReservationRequest } from '../models/reservations/update-reservation.request';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private baseUrl = `${environment.apiUrl}/reservations`;

  constructor(private http: HttpClient) {}

  getAllReservations(options?: {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
  }) {
    const params = new HttpParams()
      .set('pageNo', String(options?.pageNo ?? 1))
      .set('pageSize', String(options?.pageSize ?? 10))
      .set('sortBy', options?.sortBy ?? 'id')
      .set('sortDir', options?.sortDir ?? 'ASC');

    return this.http.get<ReservationResponseDto[]>(this.baseUrl, { params });
  }

  getReservationById(id: string) {
    return this.http.get<ReservationResponseDto>(`${this.baseUrl}/${id}`);
  }

  getReservationsByVenue(venueId: string, options?: {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
  }) {
    const params = new HttpParams()
      .set('pageNo', String(options?.pageNo ?? 1))
      .set('pageSize', String(options?.pageSize ?? 10))
      .set('sortBy', options?.sortBy ?? 'id')
      .set('sortDir', options?.sortDir ?? 'ASC');

    return this.http.get<ReservationResponseDto[]>(`${this.baseUrl}/venue/${venueId}`, { params });
  }

  getReservationsByUser(userId: string, options?: {
    pageNo?: number;
    pageSize?: number;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
  }) {
    const params = new HttpParams()
      .set('pageNo', String(options?.pageNo ?? 1))
      .set('pageSize', String(options?.pageSize ?? 10))
      .set('sortBy', options?.sortBy ?? 'id')
      .set('sortDir', options?.sortDir ?? 'ASC');

    return this.http.get<ReservationResponseDto[]>(`${this.baseUrl}/user/${userId}`, { params });
  }

  createReservation(request: CreateReservationRequest) {
    return this.http.post<ReservationResponseDto>(this.baseUrl, request);
  }

  updateReservation(id: string, request: UpdateReservationRequest) {
    return this.http.put<ReservationResponseDto>(`${this.baseUrl}/${id}`, request);
  }

  acceptReservation(id: string) {
    return this.http.put<ReservationResponseDto>(`${this.baseUrl}/${id}/accept`, {});
  }

  rejectReservation(id: string, reason?: string) {
    return this.http.put<ReservationResponseDto>(
      `${this.baseUrl}/${id}/reject`, 
      { reason: reason || null }
    );
  }

  cancelReservation(id: string) {
    return this.http.put<ReservationResponseDto>(`${this.baseUrl}/${id}/cancel`, {});
  }

  deleteReservation(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
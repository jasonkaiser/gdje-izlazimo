import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalUsers: number;
  activeVenues: number;
  inactiveVenues: number;
  totalReservations: number;
  pendingReservations: number;
  acceptedReservations: number;
  rejectedReservations: number;
  cancelledReservations: number;
  totalTableTypes: number;
}

export interface ActivityLog {
  id: string;
  entityType: 'USER' | 'VENUE' | 'RESERVATION' | 'TABLE_TYPE' | 'SYSTEM';
  entityId: string;
  entityName: string;
  actionType: 'CREATED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED' | 'ACTIVATED' | 'DEACTIVATED';
  message: string;
  status: 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  performedBy: string;
  createdAt: string;
}

export interface VenueTypeBreakdown {
  venueType: string;
  count: number;
  percentage: number;
}

export interface ReservationStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface TopVenue {
  venueId: string;
  venueName: string;
  addressName: string;
  venueType: string;
  isActive: boolean;
  reservationCount: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/admin/dashboard`;


  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getVenueTypeBreakdown(): Observable<VenueTypeBreakdown[]> {
    return this.http.get<VenueTypeBreakdown[]>(`${this.baseUrl}/venue-breakdown`);
  }

 
  getReservationStatusBreakdown(): Observable<ReservationStatusBreakdown[]> {
    return this.http.get<ReservationStatusBreakdown[]>(`${this.baseUrl}/reservation-breakdown`);
  }

  getTopVenues(limit: number = 5): Observable<TopVenue[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<TopVenue[]>(`${this.baseUrl}/top-venues`, { params });
  }

  
  getRecentActivities(page: number = 0, size: number = 10): Observable<PagedResponse<ActivityLog>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<ActivityLog>>(`${this.baseUrl}/activities`, { params });
  }

  
  getTopRecentActivities(limit: number = 10): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.baseUrl}/activities/recent/${limit}`);
  }
}
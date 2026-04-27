import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { EventResponseDto } from '../models/events/event-response.dto';

import { CreateEventDto } from '../models/events/create-event.request';
import { UpdateEventDto } from '../models/events/update-event.request';
import { Observable } from 'rxjs';


export interface EventPageOptions {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  private buildPageParams(options?: EventPageOptions): HttpParams {
    return new HttpParams()
      .set('pageNo',   String(options?.pageNo   ?? 1))
      .set('pageSize', String(options?.pageSize  ?? 6))
      .set('sortBy',   options?.sortBy  ?? 'eventDateTime')
      .set('sortDir',  options?.sortDir ?? 'ASC');
  }

  getEvents(options?: EventPageOptions) {
    return this.http.get<EventResponseDto[]>(this.baseUrl, {
      params: this.buildPageParams(options),
    });
  }

  getUpcomingEvents(): Observable<EventResponseDto[]> {
    return this.http.get<EventResponseDto[]>(`${this.baseUrl}/upcoming`);
  }

  searchEvents(params: {
    query?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDir?: 'ASC' | 'DESC';
    pageNo?: number;
    pageSize?: number;
  }) {
    let httpParams = new HttpParams();
    if (params.query)             httpParams = httpParams.set('query',    params.query);
    if (params.dateFrom)          httpParams = httpParams.set('dateFrom', params.dateFrom);
    if (params.dateTo)            httpParams = httpParams.set('dateTo',   params.dateTo);
    if (params.sortBy)            httpParams = httpParams.set('sortBy',   params.sortBy);
    if (params.sortDir)           httpParams = httpParams.set('sortDir',  params.sortDir);
    if (params.pageNo  != null)   httpParams = httpParams.set('pageNo',   params.pageNo);
    if (params.pageSize != null)  httpParams = httpParams.set('pageSize', params.pageSize);
    return this.http.get<EventResponseDto[]>(`${this.baseUrl}/search`, { params: httpParams });
  }

  getEventById(id: string) {
    return this.http.get<EventResponseDto>(`${this.baseUrl}/${id}`);
  }

  getEventsByVenue(venueId: string, options?: EventPageOptions) {
    return this.http.get<EventResponseDto[]>(`${this.baseUrl}/venue/${venueId}`, {
      params: this.buildPageParams(options),
    });
  }

  uploadEventImage(eventId: string, file: File): Observable<EventResponseDto> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<EventResponseDto>(`${this.baseUrl}/${eventId}/image`, formData);
  }

  recordView(id: string): Observable<EventResponseDto> {
    return this.http.post<EventResponseDto>(`${this.baseUrl}/${id}/view`, {});
  }

  deleteEventImage(eventId: string): Observable<EventResponseDto> {
    return this.http.delete<EventResponseDto>(`${this.baseUrl}/${eventId}/image`);
  }

  createEvent(dto: CreateEventDto) {
    return this.http.post<EventResponseDto>(this.baseUrl, dto);
  }

  updateEvent(id: string, dto: UpdateEventDto) {
    return this.http.put<EventResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  deleteEvent(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
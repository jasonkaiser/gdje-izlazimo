import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VenueResponseDto } from '../models/venues/venue-response.dto';
import { CreateVenueRequest } from '../models/venues/create-venue.request';
import { UpdateVenueRequest } from '../models/venues/update-venue.request';
import { VenueCategory } from '../models/venues/venue-category.enum';


@Injectable({
  providedIn: 'root',
})
export class VenueService {

    private baseUrl = `${environment.apiUrl}/venues`

    constructor(private http: HttpClient){}
    

    getVenues(options?: {
      pageNo?: number;
      pageSize?: number;
      venueType?: VenueCategory; 
      sortBy?: string;
      sortDir?: 'ASC' | 'DESC';
    }) {
      let params = new HttpParams()
        .set('pageNo', String(options?.pageNo ?? 1))
        .set('pageSize', String(options?.pageSize ?? 6))
        .set('sortBy', options?.sortBy ?? 'id')
        .set('sortDir', options?.sortDir ?? 'ASC');

      if (options?.venueType) params = params.set('venueType', options.venueType);

      return this.http.get<VenueResponseDto[]>(this.baseUrl, { params });
    }

    getVenueById(id : string){
      return this.http.get<VenueResponseDto>(`${this.baseUrl}/${id}`);
    }

    searchVenues(options : {
      query?: string;
      venueType?: VenueCategory;
      pageNo?: number;
      pageSize?: number;
      sortBy?: string;
      sortDir?: 'ASC' | 'DESC';

    }) {
      let params = new HttpParams();

      if(options.query) params = params.set('query', options.query);
      if(options.venueType) params = params.set('venueType', options.venueType);

      params = params.set('pageNo', String(options.pageNo ?? 1));
      params = params.set('pageSize', String(options.pageSize ?? 6));
      params = params.set('sortBy', options.sortBy ?? 'name');
      params = params.set('sortDir', options.sortDir ?? 'ASC');

      return this.http.get<VenueResponseDto[]>(`${this.baseUrl}/search`, { params });
    }

    createVenue(request: CreateVenueRequest){
      return this.http.post<VenueResponseDto>(this.baseUrl, request);
    }

    updateVenue(request: UpdateVenueRequest, id: string){
      return this.http.put<VenueResponseDto>(`${this.baseUrl}/${id}`, request);
    }

    deleteVenue(id : string){
      return this.http.delete<void>(`${this.baseUrl}/${id}`);

    }

    getMyVenue() {
      return this.http.get<VenueResponseDto>(`${this.baseUrl}/my-venue`);
    }

}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VenueTableTypeResponseDto } from '../models/venue-table-types/venue-table-type-response.dto';
import { CreateVenueTableTypeRequest } from '../models/venue-table-types/create-venue-table-type.request';
import { UpdateVenueTableTypeRequest } from '../models/venue-table-types/update-venue-table-type.request';

@Injectable({ providedIn: 'root' })
export class VenueTableTypeService {
  private baseUrl = `${environment.apiUrl}/venue/table-types`;

  constructor(private http: HttpClient) {}

  getAllVenueTableTypes() {
    return this.http.get<VenueTableTypeResponseDto[]>(this.baseUrl);
  }

  getVenueTableTypeById(id: string) {
    return this.http.get<VenueTableTypeResponseDto>(`${this.baseUrl}/${id}`);
  }

  createVenueTableType(request: CreateVenueTableTypeRequest) {
    return this.http.post<VenueTableTypeResponseDto>(this.baseUrl, request);
  }

  updateVenueTableType(id: string, request: UpdateVenueTableTypeRequest) {
    return this.http.put<VenueTableTypeResponseDto>(`${this.baseUrl}/${id}`, request);
  }

  deleteVenueTableType(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

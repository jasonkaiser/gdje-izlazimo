import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TableTypeResponseDto } from '../models/table-types/table-type-response.dto';
import { CreateTableTypeRequest } from '../models/table-types/create-table-type.request';
import { UpdateTableTypeRequest } from '../models/table-types/update-table-type.request';

@Injectable({ providedIn: 'root' })
export class TableTypeService {
  private baseUrl = `${environment.apiUrl}/table-types`;

  constructor(private http: HttpClient) {}

  getAllTableTypes() {
    return this.http.get<TableTypeResponseDto[]>(this.baseUrl);
  }

  getTableTypeById(id: string) {
    return this.http.get<TableTypeResponseDto>(`${this.baseUrl}/${id}`);
  }

  createTableType(request: CreateTableTypeRequest) {
    return this.http.post<TableTypeResponseDto>(this.baseUrl, request);
  }

  updateTableType(id: string, request: UpdateTableTypeRequest) {
    return this.http.put<TableTypeResponseDto>(`${this.baseUrl}/${id}`, request);
  }

  deleteTableType(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role } from '../models/users/user-role.enum';
import { UserResponseDto } from '../models/users/user-response.dto';
import { UpdateUserRequest } from '../models/users/update-user.request';

@Injectable({ providedIn: 'root' })
export class UserService {

  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getUsers(options?: {
    pageNo?: number;
    pageSize?: number;
    role?: Role;
    sortBy?: string;
    sortDir?: string;
  }): Observable<UserResponseDto[]> {
    let params = new HttpParams()
      .set('pageNo',   String(options?.pageNo   ?? 1))
      .set('pageSize', String(options?.pageSize ?? 10))
      .set('sortBy',   String(options?.sortBy   ?? 'id'))
      .set('sortDir',  String(options?.sortDir  ?? 'ASC'));

    if (options?.role) params = params.set('role', options.role);

    return this.http.get<UserResponseDto[]>(this.baseUrl, { params });
  }

  getUser(id: string): Observable<UserResponseDto> {
    return this.http.get<UserResponseDto>(`${this.baseUrl}/${id}`);
  }

  updateUser(request: UpdateUserRequest, id: string): Observable<UserResponseDto> {
    return this.http.put<UserResponseDto>(`${this.baseUrl}/${id}`, request);
  }

  updateUserRole(id: string, role: Role): Observable<UserResponseDto> {
    return this.http.patch<UserResponseDto>(
      `${this.baseUrl}/${id}/role`,
      null,
      { params: new HttpParams().set('role', role) }
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadProfileImage(userId: string, file: File): Observable<UserResponseDto> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<UserResponseDto>(`${this.baseUrl}/${userId}/profile-image`, form);
  }

  deleteProfileImage(userId: string): Observable<UserResponseDto> {
    return this.http.delete<UserResponseDto>(`${this.baseUrl}/${userId}/profile-image`);
  }
}
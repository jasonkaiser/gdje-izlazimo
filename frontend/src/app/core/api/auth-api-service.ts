import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UserResponseDto } from '../models/users/user-response.dto';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  me() {
    return this.http.get<UserResponseDto>(`${this.baseUrl}/me`);
  }
}

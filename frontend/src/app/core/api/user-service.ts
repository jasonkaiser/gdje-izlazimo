import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Role } from '../models/users/user-role.enum';
import { UserResponseDto } from '../models/users/user-response.dto';
import { CreateUserRequest } from '../models/users/create-user.request';
import { UpdateUserRequest } from '../models/users/update-user.request';

@Injectable({
  providedIn: 'root',
})
export class UserService {

    private baseUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient){}


    getUsers(options?: {
          pageNo?: number,
          pageSize?: number,
          role?: Role,
          sortBy?: string,
          sortDir?: string

    }){

      let params = new HttpParams()
          .set('pageNo', String(options?.pageNo ?? 1))
          .set('pageSize', String(options?.pageSize ?? 10))
          .set('sortBy', String(options?.sortBy ?? 'id'))
          .set('sortDir', String(options?.sortDir ?? 'ASC'))


      if(options?.role) params = params.set('role', options.role);

      return this.http.get<UserResponseDto[]>(this.baseUrl, { params });

    }

    getUser(id : string){
        return this.http.get<UserResponseDto>(`${this.baseUrl}/${id}`);
    }

    updateUser(request : UpdateUserRequest, id: string){
      return this.http.put<UserResponseDto>(`${this.baseUrl}/${id}`, request);
    }

    updateUserRole(id: string, role: Role) {
      return this.http.patch<UserResponseDto>(
        `${this.baseUrl}/${id}/role`,
        null,
        { params: new HttpParams().set('role', role) }
      );
    }

    deleteUser(id: string){
      return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }


}

import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthApiService } from '../api/auth-api-service';
import { Role } from '../models/users/user-role.enum';

export const adminGuard = () => {
  const authService = inject(AuthApiService);
  const router = inject(Router);

  return authService.me().pipe(
    map(user => {
      if (user.role === Role.ADMIN) {
        return true;
      }
      router.navigate(['/']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
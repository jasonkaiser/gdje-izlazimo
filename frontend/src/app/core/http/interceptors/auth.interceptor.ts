import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, switchMap, of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  if (!isBrowser) {
    return next(req);
  }

  const authService = inject(AuthService);

  if (!authService.getInitializationStatus()) {
    return next(req);
  }

  return from(authService.getToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        console.warn('No Keycloak token for:', req.url);
      }

      return next(req);
    })
  );
};
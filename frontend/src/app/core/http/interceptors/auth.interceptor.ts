import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { from, switchMap, of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);

  // Skip auth in SSR
  if (!isBrowser) {
    console.log('[AuthInterceptor] SSR - skipping auth for:', req.url);
    return next(req);
  }

  const authService = inject(AuthService);

  // Check if Keycloak is initialized
  if (!authService.getInitializationStatus()) {
    console.warn('[AuthInterceptor] Keycloak not initialized yet for:', req.url);
    return next(req);
  }

  // Get token asynchronously from Keycloak
  return from(authService.getToken()).pipe(
    switchMap(token => {
      // If token exists, clone request and add Authorization header
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('[AuthInterceptor] ✅ Added Keycloak token to:', req.url);
      } else {
        console.warn('[AuthInterceptor] ⚠️ No Keycloak token for:', req.url);
      }

      return next(req);
    })
  );
};
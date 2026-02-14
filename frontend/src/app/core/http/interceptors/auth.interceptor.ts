import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }


  const publicPrefixes = [
    '/venue-images',
    '/events',
    '/table-types',
    '/venue/operating-hours',
    '/venue/table-types',

    
    '/venues', 
  ];

  
  const privateExceptions = [
    '/venues/my-venue',
  ];

  const isPrivateException = privateExceptions.some(p =>
    req.url.startsWith(`${environment.apiUrl}${p}`)
  );

  const isPublic = publicPrefixes.some(p =>
    req.url.startsWith(`${environment.apiUrl}${p}`)
  );

  if (isPublic && !isPrivateException) {
    return next(req);
  }

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);

      return next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      );
    })
  );
};

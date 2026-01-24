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

  const publicPaths = ['/venues', '/venue-images'];
  const isPublic = publicPaths.some(p => req.url.startsWith(`${environment.apiUrl}${p}`));
  if (isPublic) return next(req);

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });

      return next(authReq);
    })
  );
};

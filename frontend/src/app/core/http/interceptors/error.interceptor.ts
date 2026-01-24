import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../ui/toast';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message =
        err?.error?.message ??
        (typeof err?.error === 'string' ? err.error : null) ??
        err?.message ??
        'Unexpected server error';

      const variant =
        err.status === 401 || err.status === 403 ? 'warning' : 'error';

      if (err.status === 0) {
        toast.show('Backend is offline / network error', 'error');
      } else {
        toast.show(message, variant);
      }

      return throwError(() => err);
    })
  );
};

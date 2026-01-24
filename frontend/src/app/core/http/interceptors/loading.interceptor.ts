import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { LoadingService } from '../loading-service';
import { environment } from '../../../../environments/environment';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  const isApiCall = req.url.startsWith(environment.apiUrl);
  if (!isApiCall) return next(req);

  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};

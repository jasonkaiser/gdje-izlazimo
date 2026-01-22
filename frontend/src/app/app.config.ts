import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),

    provideAppInitializer(() => {
      const authService = inject(AuthService);
      return authService.init(); 
    })
  ]
};

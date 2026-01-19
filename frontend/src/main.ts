import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAppInitializer } from '@angular/core';
import { inject } from '@angular/core';
import { AuthService } from './app/core/auth/auth.service';

bootstrapApplication(App, {
  providers: [
    provideRouter([]),
    provideHttpClient(),
    provideAppInitializer(() => {
      const initializerFn = () => {
        const authService = inject(AuthService);
        console.log('Initializing Keycloak...');
        return authService.init().then(result => {
          console.log('Keycloak initialization result:', result);
          return result;
        });
      };
      return initializerFn();
    })
  ]
}).catch(err => console.error(err));
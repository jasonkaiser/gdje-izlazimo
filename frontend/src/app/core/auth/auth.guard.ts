import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    console.log('Access granted to protected route:', state.url);
    return true;
  }

  console.log('Access denied to protected route:', state.url, '- User not authenticated');
  
  router.navigate(['/']);
  return false;
};


export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    console.log('Access granted to public route:', state.url);
    return true;
  }

  console.log('Access denied to public route:', state.url, '- User already authenticated');
  
  router.navigate(['/dashboard']);
  return false;
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';


export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      console.log('Access denied - User not authenticated');
      router.navigate(['/']);
      return false;
    }

    const userProfile = authService.getUserProfile();
    const userRoles = userProfile?.realm_access?.roles || [];
    
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (hasRole) {
      console.log('Access granted - User has required role');
      return true;
    }

    console.log('Access denied - User lacks required role. Required:', allowedRoles, 'Has:', userRoles);
    router.navigate(['/unauthorized']);
    return false;
  };
}
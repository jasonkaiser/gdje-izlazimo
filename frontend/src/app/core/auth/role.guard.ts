import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const platformId = inject(PLATFORM_ID);
    
    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/']);
      return false;
    }

    const userProfile = authService.getUserProfile();
    const userRoles = userProfile?.realm_access?.roles || [];
    
    const hasRole = allowedRoles.some(role => userRoles.includes(role));

    if (!hasRole) {
      router.navigate(['/']);
      return false;
    }

    return true;
  };
}
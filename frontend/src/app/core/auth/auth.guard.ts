import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const platformId = inject(PLATFORM_ID);
  
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);

  if (!authService.getInitializationStatus()) {
    await authService.init();
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  authService.login();
  return false;
};
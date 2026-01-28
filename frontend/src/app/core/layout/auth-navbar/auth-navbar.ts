import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

type AppRole = 'user' | 'venue_owner' | 'admin';

@Component({
  selector: 'app-auth-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './auth-navbar.html'
})
export class AuthNavbar {

  
  constructor(public authService: AuthService) {}

  mobileOpen = false;

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile() {
    this.mobileOpen = false;
  }
  
  private roles(): string[] {
    const profile: any = this.authService.getUserProfile();
    return profile?.realm_access?.roles ?? [];
  }

  hasRole(role: AppRole): boolean {
    return this.roles().includes(role);
  }

  async logout() {
    await this.authService.logout(); 
  }
}

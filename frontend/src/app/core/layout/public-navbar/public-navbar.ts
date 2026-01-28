import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-public-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './public-navbar.html',
})
export class PublicNavbar {

  constructor(private authService: AuthService){}

  mobileOpen = false;

  toggleMobile() {
    this.mobileOpen = !this.mobileOpen;
  }

  closeMobile() {
    this.mobileOpen = false;
  }

  login() {
    this.authService.login();
  }
}

import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  constructor(public authService: AuthService) {
    console.log('App constructor - AuthService initialized:', this.authService.getInitializationStatus());
  }

  ngOnInit() {
    console.log('App ngOnInit - AuthService initialized:', this.authService.getInitializationStatus());
    console.log('Is authenticated:', this.authService.isAuthenticated());
  }

  login() {
    console.log('Login button clicked');
    this.authService.login();
  }

  logout() {
    console.log('Logout button clicked');
    this.authService.logout();
  }
}
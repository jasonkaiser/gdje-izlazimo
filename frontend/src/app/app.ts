import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { AuthNavbar } from './core/layout/auth-navbar/auth-navbar';
import { PublicNavbar } from './core/layout/public-navbar/public-navbar';
import { VenueCard } from "./components/cards/venue-card/venue-card";
import { ButtonComponent } from './components/buttons/button-component/button-component';
import { Toast } from './components/other/toast/toast';
import { ReservationCard } from './components/cards/reservation-card/reservation-card';
import { ReservationModal } from './components/modals/reservation-modal/reservation-modal';
import { VenueService } from './core/api/venue-service';
import { ToastHost } from './core/ui/toast-host/toast-host';
import { VenueResponseDto } from './core/models/venues/venue-response.dto';
import { LoadingBar } from './components/other/loading-bar/loading-bar';
import { AppFooterComponent } from "./core/layout/footer/footer";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthNavbar, PublicNavbar, ToastHost, LoadingBar, AppFooterComponent, AppFooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  loading = false;
  venues: VenueResponseDto[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit() {
  }
}
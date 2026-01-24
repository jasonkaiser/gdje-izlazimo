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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AuthNavbar, PublicNavbar, VenueCard, ButtonComponent, Toast, ReservationCard, ReservationModal],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  open = true;

  constructor(public authService: AuthService, private venueService: VenueService) {}

  getVenues(){
    this.venueService.getVenues().subscribe({

        next: (data) => console.log('VENUES', data),
        error: (err) => console.error(err)

    })
  }

  ngOnInit() {

      this.getVenues();

  }
}

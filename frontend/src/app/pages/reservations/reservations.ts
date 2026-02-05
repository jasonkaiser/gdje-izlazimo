import { Component } from '@angular/core';
import { ReservationCard } from '../../components/cards/reservation-card/reservation-card';
import { ReservationStatus } from '../../core/models/reservations/reservation-status.enum';

@Component({
  selector: 'app-reservations',
  imports: [ReservationCard],
  standalone: true,
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations {

    reservations = [
    {
      id: '1',
      venueName: 'Cinemas Sloga',
      address: 'Hamdije Kreševljakovića 61',
      timeLabel: '20:00',
      dateLabel: '20.05.2026',
      numberOfPeople: 5,
      status: ReservationStatus.PENDING,
    },
    {
      id: '2',
      venueName: 'Club Aqua',
      address: 'Zmaja od Bosne 12',
      timeLabel: '22:30',
      dateLabel: '18.05.2026',
      numberOfPeople: 3,
      status: ReservationStatus.ACCEPTED,
    },
    {
      id: '3',
      venueName: 'Jazz Bar',
      address: 'Obala Kulina bana 4',
      timeLabel: '21:00',
      dateLabel: '10.05.2026',
      numberOfPeople: 2,
      status: ReservationStatus.CANCELLED,
    },
  ];

}

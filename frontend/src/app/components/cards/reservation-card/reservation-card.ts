import { Component, Input, computed } from '@angular/core';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { ReservationStatus } from '../../../core/models/reservations/reservation-status.enum';


type StatusStyle = {
  accent: string;
  badgeBg: string;
  badgeText: string;
};

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './reservation-card.html',
  styleUrl: './reservation-card.css',
})
export class ReservationCard {

  @Input({ required: true}) reservation!: {
    venueName: string;
    address: string;
    dateLabel: string;
    timeLabel: string;
    numberOfPeople: number;
    status : ReservationStatus | ReservationStatus.PENDING;
  }


  readonly statusStyles: Record<ReservationStatus, StatusStyle> = {

        PENDING: {
          accent: 'rgba(255,174,0',
          badgeBg: 'rgba(255,188,64,0.14)',
          badgeText: '#FFAE00',
        },
        ACCEPTED: {
          accent: 'rgba(34,197,94',
          badgeBg: 'rgba(34,197,94,0.15)',
          badgeText: '#22C55E',
        },
        REJECTED: {
          accent: 'rgba(239,68,68',
          badgeBg: 'rgba(239,68,68,0.15)',
          badgeText: '#EF4444',
        },
        CANCELLED: {
        accent: 'rgba(148,163,184',      
        badgeBg: 'rgba(148,163,184,0.14)',
        badgeText: '#CBD5E1',
      },

    };

  
  readonly style = computed(() => this.statusStyles[this.reservation.status]);

  };

 


import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy, computed
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReservationResponseDto } from '../../../core/models/reservations/reservation-response.dto';
import { ReservationStatus } from '../../../core/models/reservations/reservation-status.enum';

type StatusStyle = {
  accent: string;
  badgeBg: string;
  badgeText: string;
};

@Component({
  selector: 'app-venue-reservation-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe],
  templateUrl: './venue-reservation-card.html',
})
export class VenueReservationCardComponent {

  @Input({ required: true }) reservation!: ReservationResponseDto;

  @Output() accept      = new EventEmitter<string>();
  @Output() reject      = new EventEmitter<string>();
  @Output() viewDetails = new EventEmitter<string>();

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

  readonly style = computed(() => {
    const status = this.reservation?.status;
    return status ? this.statusStyles[status] : this.statusStyles[ReservationStatus.PENDING];
  });

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING:   'Na čekanju',
      ACCEPTED:  'Prihvaćena',
      REJECTED:  'Odbijena',
      CANCELLED: 'Otkazana',
    };
    return labels[status] ?? status;
  }

  onAccept():      void { this.accept.emit(this.reservation.id); }
  onReject():      void { this.reject.emit(this.reservation.id); }
  onViewDetails(): void { this.viewDetails.emit(this.reservation.id); }
}
import {
  Component, input, output, computed,
  signal, HostListener, ChangeDetectionStrategy
} from '@angular/core';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { ReservationStatus } from '../../../core/models/reservations/reservation-status.enum';
import { ReservationResponseDto } from '../../../core/models/reservations/reservation-response.dto';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReservationCard {

  readonly reservation      = input.required<ReservationResponseDto | null>();
  readonly cancel           = output<string>();
  readonly viewDetails      = output<string>();
  readonly viewRejectReason = output<string>();
  readonly openRating       = output<ReservationResponseDto>();

  menuOpen     = false;
  alreadyRated = signal(false);

  @HostListener('document:click')
  onDocumentClick(): void { this.menuOpen = false; }

  toggleMenu(): void { this.menuOpen = !this.menuOpen; }
  closeMenu(): void  { this.menuOpen = false; }

  onCancel(): void {
    const id = this.reservation()?.id;
    if (id) this.cancel.emit(id);
  }

  onViewDetails(): void {
    const id = this.reservation()?.id;
    if (id) this.viewDetails.emit(id);
  }

  onViewRejectReason(): void {
    const id = this.reservation()?.id;
    if (id) this.viewRejectReason.emit(id);
  }

  openRatingModal(): void {
    const r = this.reservation();
    if (!r) return;
    this.openRating.emit(r);
    this.closeMenu();
  }
  
  readonly forceAlreadyRated = input<boolean>(false);
    get canRate(): boolean {
      const r = this.reservation();
      if (!r) return false;
      if (r.status !== ReservationStatus.ACCEPTED) return false;
      if (this.alreadyRated() || this.forceAlreadyRated()) return false;
      return new Date(r.reservationDate) < new Date();
    }

  private readonly statusStyles: Record<ReservationStatus, StatusStyle> = {
    PENDING: {
      accent:    'rgba(255,174,0',
      badgeBg:   'rgba(255,188,64,0.14)',
      badgeText: '#FFAE00',
    },
    ACCEPTED: {
      accent:    'rgba(34,197,94',
      badgeBg:   'rgba(34,197,94,0.15)',
      badgeText: '#22C55E',
    },
    REJECTED: {
      accent:    'rgba(239,68,68',
      badgeBg:   'rgba(239,68,68,0.15)',
      badgeText: '#EF4444',
    },
    CANCELLED: {
      accent:    'rgba(148,163,184',
      badgeBg:   'rgba(148,163,184,0.14)',
      badgeText: '#CBD5E1',
    },
  };

  readonly style = computed(() => {
    const status = this.reservation()?.status;
    return status
      ? this.statusStyles[status]
      : this.statusStyles[ReservationStatus.PENDING];
  });



}
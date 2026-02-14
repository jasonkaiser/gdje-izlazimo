import { Component, Input, Output, computed, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [ButtonComponent, CommonModule],
  templateUrl: './reservation-card.html',
  styleUrl: './reservation-card.css',
})
export class ReservationCard {

  @Input({ required: true }) reservation: ReservationResponseDto | null = null;

  @Output() cancel = new EventEmitter<string>();
  @Output() viewDetails = new EventEmitter<string>();
  @Output() viewRejectReason = new EventEmitter<string>();

  menuOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close menu when clicking outside
    this.menuOpen = false;
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  onCancel(){
    this.cancel.emit(this.reservation?.id);
  }

  onViewDetails(){
    this.viewDetails.emit(this.reservation?.id);
  }

  onViewRejectReason(){
    this.viewRejectReason.emit(this.reservation?.id);
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

  
    readonly style = computed(() => {
      const status = this.reservation?.status;
      return status ? this.statusStyles[status] : this.statusStyles[ReservationStatus.PENDING];
    });

  }
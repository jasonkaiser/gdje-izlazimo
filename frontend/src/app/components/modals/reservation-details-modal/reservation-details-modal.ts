import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationResponseDto } from '../../../core/models/reservations/reservation-response.dto';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { ModalService } from '../../../core/services/modal';


@Component({
  selector: 'app-reservation-details-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './reservation-details-modal.html',
  styleUrl: './reservation-details-modal.css',
})
export class ReservationDetailsModalComponent implements OnInit {
  @Input() data!: ReservationResponseDto;
  
  reservation!: ReservationResponseDto;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    this.reservation = this.data;
  }

  getStatusStyle() {
    const styles: Record<string, { accent: string; badgeBg: string; badgeText: string }> = {
      PENDING: {
        accent: 'rgba(255,174,0,1)',
        badgeBg: 'rgba(255,188,64,0.14)',
        badgeText: '#FFAE00',
      },
      ACCEPTED: {
        accent: 'rgba(34,197,94,1)',
        badgeBg: 'rgba(34,197,94,0.15)',
        badgeText: '#22C55E',
      },
      REJECTED: {
        accent: 'rgba(239,68,68,1)',
        badgeBg: 'rgba(239,68,68,0.15)',
        badgeText: '#EF4444',
      },
      CANCELLED: {
        accent: 'rgba(148,163,184,1)',
        badgeBg: 'rgba(148,163,184,0.14)',
        badgeText: '#CBD5E1',
      },
    };
    return styles[this.reservation.status] || styles['PENDING'];
  }

  onClose(): void {
    this.modalService.close();
  }
}
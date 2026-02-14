import { Component, Output, EventEmitter, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../../core/api/reservation-service';
import { ModalService } from '../../../core/services/modal';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-reject-reason-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reject-reason-modal.html',
  styleUrls: ['./reject-reason-modal.css']
})
export class RejectReasonModalComponent {
  private readonly reservationService = inject(ReservationService);
  private readonly modalService = inject(ModalService);

  @Input() data: { 
    reservationId: string; 
    venueName?: string;
    reservationDate?: string;
  } = { reservationId: '' };
  
  @Output() confirmed = new EventEmitter<void>();

  reason = '';
  isLoading = false;
  error = '';

  onConfirm(): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = '';

    this.reservationService.rejectReservation(this.data.reservationId, this.reason)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.confirmed.emit();
          this.close();
        },
        error: (err) => {
          this.isLoading = false;
          this.error = 'Greška pri odbijanju rezervacije. Pokušajte ponovo.';
          console.error('[RejectReasonModal] Reject failed:', err);
        }
      });
  }

  close(): void {
    this.modalService.close();
  }
}
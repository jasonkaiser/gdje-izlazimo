import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal';

@Component({
  selector: 'app-reject-reason-view-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reject-reason-view-modal.html',
  styleUrls: ['./reject-reason-view-modal.css']
})
export class RejectReasonViewModalComponent {
  private readonly modalService = inject(ModalService);

  @Input() data: { 
    rejectReason: string; 
    venueName?: string;
    reservationDate?: string;
    reservationTime?: string;
  } = { rejectReason: '' };

  close(): void {
    this.modalService.close();
  }
}
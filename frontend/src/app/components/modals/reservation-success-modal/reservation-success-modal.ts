import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-reservation-success-modal',
  standalone: true,
  templateUrl: './reservation-success-modal.html',
  styleUrl: './reservation-success-modal.css',
  encapsulation: ViewEncapsulation.None,
})
export class ReservationSuccessModal {
  @Input() venueName = '';
  @Input() tableType = '';
  @Input() date = '';
  @Input() time = '';
  @Input() guests = 0;
  @Output() close = new EventEmitter<void>();
}
import { Component, Input } from '@angular/core';
import { ButtonComponent } from '../../buttons/button-component/button-component';
import { Badge } from '../../other/badge/badge';

type Status = 'ACCEPTED' | 'PENDING' | 'REJECTED';

@Component({
  selector: 'app-reservation-card',
  standalone: true,
  imports: [ButtonComponent, Badge],
  templateUrl: './reservation-card.html',
  styleUrl: './reservation-card.css',
})
export class ReservationCard {
  @Input() venueName: string = 'VenueName';
  @Input() category: string = 'Bar';

  @Input() dateLabel: string = '';
  @Input() timeLabel: string = '';

  @Input() status: Status = 'ACCEPTED';

  get statusVariant(): 'success' | 'pending' | 'error' {
    if (this.status === 'ACCEPTED') return 'success';
    if (this.status === 'PENDING') return 'pending';
    return 'error';
  }

  get statusText(): string {
    return this.status;
  }
}

import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../buttons/button-component/button-component';

const MONTHS_BS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
  'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
];

const DAYS_BS = [
  'Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'
];

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css',
})
export class EventCard {
  @Input() id: string = '';
  @Input() title: string = '';
  @Input() venueName: string = '';
  @Input() venueAddress: string = '';
  @Input() imageUrl: string = '';
  @Input() eventDateTime: string = '';
  @Input() viewCount: number = 0;
  @Input() trending: boolean = false;

  constructor(private router: Router) {}

  private get date(): Date | null {
    if (!this.eventDateTime) return null;
    const normalized = this.eventDateTime.endsWith('Z') || this.eventDateTime.includes('+')
      ? this.eventDateTime
      : this.eventDateTime + 'Z';
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }

  get day(): string {
    const d = this.date;
    return d ? d.getUTCDate().toString().padStart(2, '0') : '--';
  }

  get month(): string {
    const d = this.date;
    return d ? MONTHS_BS[d.getUTCMonth()] : '---';
  }

  get dayName(): string {
    const d = this.date;
    return d ? DAYS_BS[d.getUTCDay()] : '';
  }

  get time(): string {
    const d = this.date;
    if (!d) return '';
    const h = d.getUTCHours().toString().padStart(2, '0');
    const m = d.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  }

   get timingBadge(): null | 'tonight' | number {
    const d = this.date;
    if (!d) return null;

    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    if (diffMs < 0) return null; 

    const diffH = diffMs / 3_600_000;

    const sameDay = d.getUTCFullYear() === now.getUTCFullYear()
      && d.getUTCMonth() === now.getUTCMonth()
      && d.getUTCDate() === now.getUTCDate();

    if (!sameDay) return null;
    return diffH > 6 ? 'tonight' : Math.ceil(diffH);
  }

  get isTonight(): boolean { return this.timingBadge === 'tonight'; }
  get hoursUntil(): number | null {
    const b = this.timingBadge;
    return typeof b === 'number' ? b : null;
  }


  onViewDetails(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.id) this.router.navigate(['/events', this.id]);
  }
}
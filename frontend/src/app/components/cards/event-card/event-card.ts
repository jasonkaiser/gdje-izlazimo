import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../buttons/button-component/button-component';

const MONTHS_BS = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
const DAYS_BS   = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];

type BadgeKey = 'featured' | 'trending' | 'eventType' | 'tonight' | 'hours';

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
  @Input() locationName: string = '';
  @Input() locationAddress: string = '';
  @Input() venueId: string | null = null;
  @Input() eventType: string | null = null;
  @Input() imageUrl: string = '';
  @Input() eventDateTime: string = '';
  @Input() viewCount: number = 0;
  @Input() trending: boolean = false;
  @Input() featured: boolean = false;

  constructor(private router: Router) {}

  get displayName(): string {
    return this.venueName || this.locationName || '';
  }

  get displayAddress(): string {
    return this.venueAddress || this.locationAddress || '';
  }

  get isVenueEvent(): boolean {
    return !!this.venueId;
  }

  private get date(): Date | null {
    if (!this.eventDateTime) return null;

    const d = new Date(this.eventDateTime);
    return isNaN(d.getTime()) ? null : d;
  }

  get time(): string {
    const d = this.date;
    if (!d) return '';
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  get day(): string     { return this.date ? this.date.getDate().toString().padStart(2, '0') : '--'; }
  get month(): string   { return this.date ? MONTHS_BS[this.date.getMonth()] : '---'; }
  get dayName(): string { return this.date ? DAYS_BS[this.date.getDay()] : ''; }

  get timingBadge(): null | 'tonight' | number {
    const d = this.date;
    if (!d) return null;
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    if (diffMs < 0) return null;
    const diffH = diffMs / 3_600_000;
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth()    === now.getMonth()    &&
      d.getDate()     === now.getDate();
    if (!sameDay) return null;
    return diffH > 6 ? 'tonight' : Math.ceil(diffH);
  }

  get isTonight(): boolean { return this.timingBadge === 'tonight'; }

  get hoursUntil(): number | null {
    const b = this.timingBadge;
    return typeof b === 'number' ? b : null;
  }

  get eventTypeBadgeLabel(): string | null {
    if (this.isVenueEvent) return null;
    const labels: Record<string, string> = {
      FESTIVAL: 'Festival',
      CONCERT:  'Koncert',
      PARTY:    'Žurka',
    };
    return labels[this.eventType ?? ''] ?? null;
  }

  get badges(): BadgeKey[] {
    const all: BadgeKey[] = [];
    if (this.featured)                                   all.push('featured');
    if (this.trending)                                   all.push('trending');
    if (this.isTonight)                                  all.push('tonight');
    if (this.hoursUntil !== null)                        all.push('hours');
    if (!this.isVenueEvent && this.eventTypeBadgeLabel)  all.push('eventType');
    return all.slice(0, 2);
  }

  hasBadge(b: BadgeKey): boolean {
    return this.badges.includes(b);
  }

  onViewDetails(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (this.id) this.router.navigate(['/events', this.id]);
  }
}
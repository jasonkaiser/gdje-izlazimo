import { AsyncPipe, DecimalPipe } from '@angular/common';
import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import {
  catchError,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InViewDirective } from '../../core/animations/in-view.directive';
import { EventResponseDto } from '../../core/models/events/event-response.dto';
import { EventService } from '../../core/api/event-service';
import { VenueMapComponent } from '../../components/other/venue-map/venue-map';


const MONTHS_BS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];
const DAYS_BS = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];

const EVENT_TYPE_LABELS: Record<string, string> = {
  FESTIVAL:    'Festival',
  CONCERT:     'Koncert',
  PARTY:       'Žurka',
  VENUE_EVENT: 'Događaj u lokalu',
  OTHER:       'Događaj',
};

type Vm = {
  loading: boolean;
  errorMsg: string;
  event: EventResponseDto | null;
  day: string;
  month: string;
  dayName: string;
  time: string;
  endTime: string;
  year: string;
  eventTypeLabel: string;
};

function parseEventDate(iso: string): Date | null {
  if (!iso) return null;
  const normalized = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

function buildTime(iso: string): string {
  const d = parseEventDate(iso);
  if (!d) return '';
  return `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}

function buildDateParts(iso: string) {
  const d = parseEventDate(iso);
  if (!d) return { day: '--', month: '---', dayName: '', time: '', year: '' };
  return {
    day:     d.getUTCDate().toString().padStart(2, '0'),
    month:   MONTHS_BS[d.getUTCMonth()],
    dayName: DAYS_BS[d.getUTCDay()],
    time:    `${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`,
    year:    d.getUTCFullYear().toString(),
  };
}

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [AsyncPipe, DecimalPipe, InViewDirective, RouterLink, VenueMapComponent],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventDetails {
  private readonly route      = inject(ActivatedRoute);
  private readonly eventSvc   = inject(EventService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr        = inject(ChangeDetectorRef);
  private readonly location   = inject(Location);

  private readonly retry$ = new BehaviorSubject<void>(undefined);

  heroShown   = false;
  detailShown = false;

  private openTickets = new Set<string | number>();

  isTicketOpen(id: string | number): boolean {
    return this.openTickets.has(id);
  }

  toggleTicket(id: string | number): void {
    if (this.openTickets.has(id)) {
      this.openTickets.delete(id);
    } else {
      this.openTickets.add(id);
    }
    this.cdr.markForCheck();
  }

  readonly vm$ = this.retry$.pipe(
    switchMap(() => this.route.paramMap.pipe(map((p) => p.get('id') ?? ''))),
    tap(() => {
      this.heroShown   = false;
      this.detailShown = false;
      this.openTickets.clear();        
    }),
    switchMap((id) => {
      if (!id) {
        return of<Vm>({
          loading: false, errorMsg: 'Neispravan link.', event: null,
          day: '--', month: '---', dayName: '', time: '', endTime: '', year: '', eventTypeLabel: '',
        });
      }

      const loading: Vm = {
        loading: true, errorMsg: '', event: null,
        day: '--', month: '---', dayName: '', time: '', endTime: '', year: '', eventTypeLabel: '',
      };

      return this.eventSvc.recordView(id).pipe(
        map((event) => ({
          loading: false,
          errorMsg: '',
          event,
          ...buildDateParts(event.eventDateTime ?? ''),
          endTime: event.eventEndDateTime ? buildTime(event.eventEndDateTime) : '',
          eventTypeLabel: EVENT_TYPE_LABELS[event.eventType ?? ''] ?? 'Događaj',
        } satisfies Vm)),
        catchError(() => of<Vm>({
          loading: false, errorMsg: 'Događaj nije pronađen.', event: null,
          day: '--', month: '---', dayName: '', time: '', endTime: '', year: '', eventTypeLabel: '',
        })),
        startWith(loading),
      );
    }),
    takeUntilDestroyed(this.destroyRef),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  retry(): void { this.retry$.next(); }

  copied = false;

  share(eventName: string): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: eventName, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.copied = true;
        this.cdr.markForCheck();
        setTimeout(() => { this.copied = false; this.cdr.markForCheck(); }, 2000);
      }).catch(() => {});
    }
  }

  onHeroInView(v: boolean):   void { if (v) this.heroShown   = true; }
  onDetailInView(v: boolean): void { if (v) this.detailShown = true; }

  goBack(): void { this.location.back(); }
}
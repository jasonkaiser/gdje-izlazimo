import { AsyncPipe } from '@angular/common';
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

const MONTHS_BS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
];
const DAYS_BS = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'];

type Vm = {
  loading: boolean;
  errorMsg: string;
  event: EventResponseDto | null;
  day: string;
  month: string;
  dayName: string;
  time: string;
  year: string;
};

function parseEventDate(iso: string): Date | null {
  if (!iso) return null;
  const normalized = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
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
  imports: [AsyncPipe, InViewDirective, RouterLink],
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



readonly vm$ = this.retry$.pipe(
  switchMap(() => this.route.paramMap.pipe(map((p) => p.get('id') ?? ''))),
  tap(() => { this.heroShown = false; this.detailShown = false; }),
  switchMap((id) => {
    if (!id) {
      return of<Vm>({ loading: false, errorMsg: 'Neispravan link.', event: null, day: '--', month: '---', dayName: '', time: '', year: '' });
    }

    const loading: Vm = { loading: true, errorMsg: '', event: null, day: '--', month: '---', dayName: '', time: '', year: '' };

    return this.eventSvc.recordView(id).pipe(  
      map((event) => ({
        loading: false,
        errorMsg: '',
        event,
        ...buildDateParts(event.eventDateTime ?? ''),
      } satisfies Vm)),
      catchError(() => of<Vm>({ loading: false, errorMsg: 'Događaj nije pronađen.', event: null, day: '--', month: '---', dayName: '', time: '', year: '' })),
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

    goBack(): void {
    this.location.back();
  }
}
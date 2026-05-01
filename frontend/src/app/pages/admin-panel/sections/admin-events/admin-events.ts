import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  shareReplay,
  debounceTime,
  take,
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventResponseDto } from '../../../../core/models/events/event-response.dto';
import { EventService } from '../../../../core/api/event-service';
import { VenueService } from '../../../../core/api/venue-service';
import { VenueResponseDto } from '../../../../core/models/venues/venue-response.dto';
import { ModalService } from '../../../../core/services/modal';
import { ToastService } from '../../../../core/ui/toast';
import { ConfirmModalComponent } from '../../../../components/modals/confirm-modal/confirm-modal';
import { AdminEventModalComponent } from '../../../../components/modals/admin-event-modal/admin-event-modal';
import { AppDropdown } from '../../../../components/other/dropdown/dropdown';

interface EventStats {
  total: number;
  upcoming: number;
  past: number;
  trending: number;
}

interface ViewModel {
  items: EventResponseDto[];
  loading: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
}

@Component({
  selector: 'app-admin-events',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AppDropdown],
  templateUrl: './admin-events.html',
  styleUrl: './admin-events.css',
})
export class AdminEventsComponent implements OnInit {

  private readonly eventService = inject(EventService);
  private readonly venueService = inject(VenueService);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef   = inject(DestroyRef);

  searchQuery   = '';
  venueFilter   = 'ALL';
  periodFilter  = 'ALL';
  readonly pageSize = 10;

  readonly periodFilterOptions = [
    { value: 'ALL',      label: 'Svi događaji' },
    { value: 'UPCOMING', label: 'Nadolazeći' },
    { value: 'PAST',     label: 'Prošli' },
    { value: 'TRENDING', label: 'Trending' },
  ];

  venueFilterOptions: { value: string; label: string }[] = [
    { value: 'ALL', label: 'Svi lokali' },
  ];

  private readonly search$       = new BehaviorSubject<string>('');
  private readonly venueFilter$  = new BehaviorSubject<string>('ALL');
  private readonly periodFilter$ = new BehaviorSubject<string>('ALL');
  private readonly pageNo$       = new BehaviorSubject<number>(1);
  private readonly refresh$      = new BehaviorSubject<void>(undefined);

  venues$!: Observable<VenueResponseDto[]>;
  stats$!:  Observable<EventStats>;
  vm$!:     Observable<ViewModel>;

  @HostListener('window:event-updated')
  onEventUpdated(): void {
    this.refresh$.next();
  }

  ngOnInit(): void {
    this.initializeStreams();
    this.loadVenueOptions();
  }

  private loadVenueOptions(): void {
    this.venueService.getVenues({ pageSize: 1000, sortBy: 'name', sortDir: 'ASC' })
      .pipe(take(1), catchError(() => of([] as VenueResponseDto[])))
      .subscribe(venues => {
        this.venueFilterOptions = [
          { value: 'ALL', label: 'Svi lokali' },
          ...venues.map(v => ({ value: v.id, label: v.name })),
        ];
      });
  }

  private initializeStreams(): void {
    const allEvents$ = this.refresh$.pipe(
      switchMap(() =>
        this.eventService.getEvents({ pageSize: 1000, sortBy: 'eventDateTime', sortDir: 'DESC' }).pipe(
          catchError(() => {
            this.toastService.show('Greška pri učitavanju događaja', 'error');
            return of([] as EventResponseDto[]);
          })
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.stats$ = allEvents$.pipe(
      map(events => {
        const now = new Date();
        return {
          total:    events.length,
          upcoming: events.filter(e => new Date(e.eventDateTime) > now).length,
          past:     events.filter(e => new Date(e.eventDateTime) <= now).length,
          trending: events.filter(e => e.trending).length,
        };
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.vm$ = combineLatest([
      allEvents$,
      this.search$.pipe(debounceTime(300)),
      this.venueFilter$,
      this.periodFilter$,
      this.pageNo$,
    ]).pipe(
      map(([allEvents, search, venueFilter, periodFilter, pageNo]) => {
        let filtered = this.applySearch(allEvents, search);
        filtered = this.applyVenueFilter(filtered, venueFilter);
        filtered = this.applyPeriodFilter(filtered, periodFilter);

        const start = (pageNo - 1) * this.pageSize;
        const end   = start + this.pageSize;
        return {
          items:    filtered.slice(start, end),
          loading:  false,
          hasMore:  end < filtered.length,
          errorMsg: '',
          pageNo,
        };
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private applySearch(events: EventResponseDto[], search: string): EventResponseDto[] {
    if (!search.trim()) return events;
    const q = search.toLowerCase();
    return events.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.venueName?.toLowerCase().includes(q) ||
      e.venueAddress?.toLowerCase().includes(q)
    );
  }

  private applyVenueFilter(events: EventResponseDto[], venueId: string): EventResponseDto[] {
    if (venueId === 'ALL') return events;
    return events.filter(e => e.venueId === venueId);
  }

  private applyPeriodFilter(events: EventResponseDto[], period: string): EventResponseDto[] {
    const now = new Date();
    if (period === 'UPCOMING') return events.filter(e => new Date(e.eventDateTime) > now);
    if (period === 'PAST')     return events.filter(e => new Date(e.eventDateTime) <= now);
    if (period === 'TRENDING') return events.filter(e => e.trending);
    return events;
  }

  onSearchChange(): void {
    this.search$.next(this.searchQuery);
    this.pageNo$.next(1);
  }

  onFilterChange(): void {
    this.venueFilter$.next(this.venueFilter);
    this.periodFilter$.next(this.periodFilter);
    this.pageNo$.next(1);
  }

  nextPage(): void { this.pageNo$.next(this.pageNo$.getValue() + 1); }
  prevPage(): void {
    const cur = this.pageNo$.getValue();
    if (cur > 1) this.pageNo$.next(cur - 1);
  }

  openCreateModal(): void {
    this.modalService.open(AdminEventModalComponent, {
      data: { mode: 'create' },
    });
  }

  editEvent(event: EventResponseDto): void {
    this.modalService.open(AdminEventModalComponent, {
      data: { mode: 'edit', event },
    });
  }

  deleteEvent(event: EventResponseDto): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      data: {
        title:       'Obriši Događaj',
        message:     `Da li ste sigurni da želite obrisati događaj "${event.name}"?\n\nOva akcija se ne može poništiti.`,
        confirmText: 'Obriši',
        cancelText:  'Otkaži',
        variant:     'danger',
      },
    });

    (modalRef.instance as ConfirmModalComponent).confirmed
      .pipe(take(1))
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.eventService.deleteEvent(event.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.refresh$.next();
              this.toastService.show('Događaj uspješno obrisan', 'success');
            },
            error: () => this.toastService.show('Greška pri brisanju događaja', 'error'),
          });
      });
  }

  isUpcoming(event: EventResponseDto): boolean {
    return new Date(event.eventDateTime) > new Date();
  }

  formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('bs-BA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('bs-BA', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  }
}
import {
  Component, ChangeDetectionStrategy, OnInit, inject, DestroyRef
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BehaviorSubject, Observable, combineLatest, of, EMPTY
} from 'rxjs';
import {
  switchMap, map, catchError, shareReplay, take, tap, debounceTime
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReservationResponseDto } from '../../core/models/reservations/reservation-response.dto';
import { VenueResponseDto } from '../../core/models/venues/venue-response.dto';
import { ReservationDetailsModalComponent } from '../../components/modals/reservation-details-modal/reservation-details-modal';
import { ModalService } from '../../core/services/modal';
import { VenueService } from '../../core/api/venue-service';
import { VenueReservationCardComponent } from '../../components/cards/venue-reservation-card/venue-reservation-card';
import { ReservationService } from '../../core/api/reservation-service';
import { RejectReasonModalComponent } from '../../components/modals/reject-reason-modal/reject-reason-modal';
import { UpdateVenueRequest } from '../../core/models/venues/update-venue.request';
import { AppDropdown } from '../../components/other/dropdown/dropdown';
import { VenueModalComponent } from '../../components/modals/venue-modal/venue-modal';

type VenueTab = 'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

type VenueTabCounts = {
  ALL: number;
  PENDING: number;
  ACCEPTED: number;
  REJECTED: number;
  CANCELLED: number;
};

type ViewModel = {
  items: ReservationResponseDto[];
  loading: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
};

type SortOption = 'date-desc' | 'date-asc' | 'time-asc' | 'time-desc' | 'people-desc' | 'people-asc';

@Component({
  selector: 'app-venue-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AsyncPipe, VenueReservationCardComponent, FormsModule, AppDropdown],
  templateUrl: './venue-panel.html',
  styleUrl: './venue-panel.css',
})
export class VenuePanelComponent implements OnInit {

  private readonly reservationService = inject(ReservationService);
  private readonly venueService       = inject(VenueService);
  private readonly modalService       = inject(ModalService);
  private readonly destroyRef         = inject(DestroyRef);

  activeTab: VenueTab = 'ALL';
  filterOpen          = false;
  mobileTabOpen       = false;
  isTogglingActive    = false;
  toggleSuccessMsg    = '';
  toggleErrorMsg      = '';
  private venueId     = '';

  searchQuery = '';
  dateFrom    = '';
  dateTo      = '';
  sortBy: SortOption = 'date-desc';

  readonly allTabs: VenueTab[] = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
  readonly pageSize = 8;

  readonly sortOptions = [
    { value: 'date-desc'   as SortOption, label: 'Datum ↓ (najnovije)' },
    { value: 'date-asc'    as SortOption, label: 'Datum ↑ (najstarije)' },
    { value: 'time-asc'    as SortOption, label: 'Vrijeme ↑ (ranije)' },
    { value: 'time-desc'   as SortOption, label: 'Vrijeme ↓ (kasnije)' },
    { value: 'people-desc' as SortOption, label: 'Broj ljudi ↓ (najviše)' },
    { value: 'people-asc'  as SortOption, label: 'Broj ljudi ↑ (najmanje)' },
  ];

  private readonly tab$       = new BehaviorSubject<VenueTab>('ALL');
  private readonly pageNo$    = new BehaviorSubject<number>(1);
  private readonly refresh$   = new BehaviorSubject<void>(undefined);
  private readonly search$    = new BehaviorSubject<string>('');
  private readonly dateRange$ = new BehaviorSubject<{ from: string; to: string }>({ from: '', to: '' });
  private readonly sort$      = new BehaviorSubject<SortOption>('date-desc');

  venue$!:              Observable<VenueResponseDto>;
  tabCounts$!:          Observable<VenueTabCounts>;
  vm$!:                 Observable<ViewModel>;
  todayReservations$!:  Observable<ReservationResponseDto[]>;

  private reservations$!: Observable<ReservationResponseDto[]>;

  ngOnInit(): void {
    this.venue$ = this.venueService.getMyVenue().pipe(
      tap((venue) => { this.venueId = venue.id; }),
      catchError((err) => {
        return EMPTY;
      }),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.reservations$ = this.venue$.pipe(
      take(1),
      switchMap((venue) =>
        this.refresh$.pipe(
          switchMap(() =>
            this.reservationService.getReservationsByVenue(venue.id, {
              pageSize: 1000,
              sortBy: 'reservationDate',
              sortDir: 'DESC',
            }).pipe(
              catchError((err) => {
                return of([] as ReservationResponseDto[]);
              })
            )
          )
        )
      ),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.tabCounts$ = this.reservations$.pipe(
      map((list) => this.countTabs(list)),
      takeUntilDestroyed(this.destroyRef)
    );

    this.todayReservations$ = this.reservations$.pipe(
      map((list) => {
        const today = new Date().toISOString().slice(0, 10);
        return list
          .filter((r) => r.reservationDate?.startsWith(today))
          .sort((a, b) => (a.reservationTime ?? '00:00').localeCompare(b.reservationTime ?? '00:00'));
      }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.vm$ = combineLatest([
      this.tab$,
      this.pageNo$,
      this.reservations$,
      this.search$.pipe(debounceTime(300)),
      this.dateRange$,
      this.sort$,
    ]).pipe(
      map(([tab, pageNo, allReservations, search, dateRange, sort]) =>
        this.buildVm(tab, pageNo, allReservations, search, dateRange, sort)
      ),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private buildVm(
    tab: VenueTab,
    pageNo: number,
    allReservations: ReservationResponseDto[],
    search: string,
    dateRange: { from: string; to: string },
    sort: SortOption
  ): ViewModel {
    let filtered = tab === 'ALL' ? allReservations : allReservations.filter((r) => r.status === tab);

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter((r) =>
        r.phone?.toLowerCase().includes(q) ||
        r.numberOfPeople?.toString().includes(q) ||
        r.userId?.toLowerCase().includes(q) ||
        r.specialRequests?.toLowerCase().includes(q)
      );
    }

    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter((r) => {
        if (!r.reservationDate) return false;
        if (dateRange.from && r.reservationDate < dateRange.from) return false;
        if (dateRange.to   && r.reservationDate > dateRange.to)   return false;
        return true;
      });
    }

    filtered = this.sortReservations(filtered, sort);

    const start   = (pageNo - 1) * this.pageSize;
    const end     = start + this.pageSize;

    return {
      items:    filtered.slice(start, end),
      loading:  false,
      hasMore:  end < filtered.length,
      errorMsg: '',
      pageNo,
    };
  }

  private sortReservations(list: ReservationResponseDto[], sort: SortOption): ReservationResponseDto[] {
    const s = [...list];
    switch (sort) {
      case 'date-desc':    return s.sort((a, b) => (b.reservationDate ?? '').localeCompare(a.reservationDate ?? ''));
      case 'date-asc':     return s.sort((a, b) => (a.reservationDate ?? '').localeCompare(b.reservationDate ?? ''));
      case 'time-asc':     return s.sort((a, b) => (a.reservationTime ?? '').localeCompare(b.reservationTime ?? ''));
      case 'time-desc':    return s.sort((a, b) => (b.reservationTime ?? '').localeCompare(a.reservationTime ?? ''));
      case 'people-desc':  return s.sort((a, b) => (b.numberOfPeople ?? 0) - (a.numberOfPeople ?? 0));
      case 'people-asc':   return s.sort((a, b) => (a.numberOfPeople ?? 0) - (b.numberOfPeople ?? 0));
      default:             return s;
    }
  }

  private countTabs(list: ReservationResponseDto[]): VenueTabCounts {
    return {
      ALL:       list.length,
      PENDING:   list.filter((r) => r.status === 'PENDING').length,
      ACCEPTED:  list.filter((r) => r.status === 'ACCEPTED').length,
      REJECTED:  list.filter((r) => r.status === 'REJECTED').length,
      CANCELLED: list.filter((r) => r.status === 'CANCELLED').length,
    };
  }

  onSearchChange(): void {
    this.search$.next(this.searchQuery);
    this.pageNo$.next(1);
  }

  onDateFilterChange(): void {
    this.dateRange$.next({ from: this.dateFrom, to: this.dateTo });
    this.pageNo$.next(1);
  }

  onSortChange(): void {
    this.sort$.next(this.sortBy);
    this.pageNo$.next(1);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.dateFrom    = '';
    this.dateTo      = '';
    this.sortBy      = 'date-desc';
    this.search$.next('');
    this.dateRange$.next({ from: '', to: '' });
    this.sort$.next('date-desc');
    this.pageNo$.next(1);
  }

  viewTodayReservations(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.dateFrom = today;
    this.dateTo   = today;
    this.onDateFilterChange();
  }

  setTab(tab: VenueTab): void {
    this.activeTab     = tab;
    this.filterOpen    = false;
    this.mobileTabOpen = false;
    this.tab$.next(tab);
    this.pageNo$.next(1);
  }

  toggleFilter(): void {
    this.filterOpen = !this.filterOpen;
  }

  toggleMobileTab(): void {
    this.mobileTabOpen = !this.mobileTabOpen;
  }

  nextPage(): void {
    this.pageNo$.next(this.pageNo$.getValue() + 1);
  }

  prevPage(): void {
    const current = this.pageNo$.getValue();
    if (current > 1) this.pageNo$.next(current - 1);
  }

  tabLabel(tab: VenueTab): string {
    const labels: Record<VenueTab, string> = {
      ALL:       'Sve',
      PENDING:   'Na čekanju',
      ACCEPTED:  'Prihvaćene',
      REJECTED:  'Odbijene',
      CANCELLED: 'Otkazane',
    };
    return labels[tab];
  }

  acceptReservation(id: string): void {
    this.reservationService.acceptReservation(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.pageNo$.next(1);
          this.refresh$.next();
        },
      });
  }

  rejectReservation(id: string): void {
    this.venue$.pipe(take(1)).subscribe((venue) => {
      const ref = this.modalService.open(RejectReasonModalComponent, {
        data: { reservationId: id, venueName: venue?.name },
      });
      ref.instance.confirmed.pipe(take(1)).subscribe(() => {
        this.pageNo$.next(1);
        this.refresh$.next();
      });
    });
  }

  viewDetails(id: string): void {
    this.reservationService.getReservationById(id)
      .pipe(take(1))
      .subscribe({
        next: (reservation) => this.modalService.open(ReservationDetailsModalComponent, { data: reservation }),
      });
  }

  toggleVenueActive(venue: VenueResponseDto): void {
    if (this.isTogglingActive) return;
    this.isTogglingActive = true;
    this.toggleSuccessMsg = '';
    this.toggleErrorMsg   = '';

    const updateRequest: UpdateVenueRequest = {
      name:        venue.name,
      venueType:   venue.venueType,
      phone:       venue.phone,
      description: venue.description,
      isActive:    !venue.isActive,
      addressName: venue.addressName,
    };

    this.venueService.updateVenue(updateRequest, venue.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isTogglingActive = false;
          this.toggleSuccessMsg = 'Status ažuriran';
          this.refresh$.next();
          setTimeout(() => { this.toggleSuccessMsg = ''; }, 3000);
        },
        error: (err) => {
          this.isTogglingActive = false;
          this.toggleErrorMsg   = 'Greška pri ažuriranju';
          setTimeout(() => { this.toggleErrorMsg = ''; }, 3000);
        },
      });
  }

  editVenue(venue: VenueResponseDto): void {
    this.modalService.open(VenueModalComponent, { data: { mode: 'edit', venue } });

    const handler = () => {
      this.refresh$.next();
      window.removeEventListener('venue-updated', handler);
    };
    window.addEventListener('venue-updated', handler);
  }
}
import {
  Component, ChangeDetectionStrategy, OnInit, inject, DestroyRef
} from '@angular/core';
import { CommonModule, AsyncPipe, DatePipe } from '@angular/common';
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
  loadingMore: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
};

type SortOption = 'date-desc' | 'date-asc' | 'time-asc' | 'time-desc' | 'people-desc' | 'people-asc';


@Component({
  selector: 'app-venue-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, AsyncPipe, DatePipe, VenueReservationCardComponent, FormsModule, AppDropdown],
  templateUrl: './venue-panel.html',
  styleUrl: './venue-panel.css',
})
export class VenuePanelComponent implements OnInit {

  private readonly reservationService = inject(ReservationService);
  private readonly venueService       = inject(VenueService);
  private readonly modalService       = inject(ModalService);
  private readonly destroyRef         = inject(DestroyRef);

  activeTab: VenueTab = 'ALL';
  filterOpen           = false;
  mobileTabOpen        = false;  
  isTogglingActive     = false;
  toggleSuccessMsg     = '';
  toggleErrorMsg       = '';
  private venueId      = '';

  searchQuery = '';
  dateFrom = '';
  dateTo = '';
  sortBy: SortOption = 'date-desc';

  readonly allTabs: VenueTab[] = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
  readonly pageSize = 8; 

  readonly sortOptions = [
    { value: 'date-desc' as SortOption, label: 'Datum ↓ (najnovije)' },
    { value: 'date-asc' as SortOption, label: 'Datum ↑ (najstarije)' },
    { value: 'time-asc' as SortOption, label: 'Vrijeme ↑ (ranije)' },
    { value: 'time-desc' as SortOption, label: 'Vrijeme ↓ (kasnije)' },
    { value: 'people-desc' as SortOption, label: 'Broj ljudi ↓ (najviše)' },
    { value: 'people-asc' as SortOption, label: 'Broj ljudi ↑ (najmanje)' },
  ]; 

  private readonly tab$    = new BehaviorSubject<VenueTab>('ALL');
  private readonly pageNo$ = new BehaviorSubject<number>(1);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  
  private readonly search$ = new BehaviorSubject<string>('');
  private readonly dateRange$ = new BehaviorSubject<{ from: string; to: string }>({ from: '', to: '' });
  private readonly sort$ = new BehaviorSubject<SortOption>('date-desc');

  private readonly pageCache    = new Map<string, ReservationResponseDto[]>();
  private readonly hasMoreCache = new Map<string, boolean>();

  reservations$!: Observable<ReservationResponseDto[]>;
  tabCounts$!:    Observable<VenueTabCounts>;
  venue$!:        Observable<VenueResponseDto>;
  vm$!:           Observable<ViewModel>;

  todayReservations$!: Observable<ReservationResponseDto[]>;
  todayCount$!: Observable<number>;


  ngOnInit(): void {
    this.initializeStreams();
  }


  private initializeStreams(): void {

  this.venue$ = this.venueService.getMyVenue().pipe(
    tap(venue => { this.venueId = venue.id; }),
    catchError(err => {
      console.error('[VenuePanelComponent] Failed to load venue:', err);
      return EMPTY;
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
    takeUntilDestroyed(this.destroyRef)
  );

  this.reservations$ = this.venue$.pipe(
    take(1),
    switchMap(venue =>
      this.refresh$.pipe(
        switchMap(() =>
          this.reservationService.getReservationsByVenue(venue.id, {
            pageSize: 1000,
            sortBy: 'reservationDate',
            sortDir: 'DESC',
          }).pipe(
            catchError(err => {
              console.error('[VenuePanelComponent] Failed to load reservations:', err);
              return of([] as ReservationResponseDto[]);
            })
          )
        )
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
    takeUntilDestroyed(this.destroyRef)
  );

  this.tabCounts$ = this.reservations$.pipe(
    map(list => this.countTabs(list)),
    takeUntilDestroyed(this.destroyRef)
  );

  this.todayReservations$ = this.reservations$.pipe(
    map(list => {
      const today = new Date().toISOString().slice(0, 10);
      return list
        .filter(r => r.reservationDate?.startsWith(today))
        .sort((a, b) => {
          const timeA = a.reservationTime ?? '00:00';
          const timeB = b.reservationTime ?? '00:00';
          return timeA.localeCompare(timeB);
        });
    }),
    takeUntilDestroyed(this.destroyRef)
  );

  this.todayCount$ = this.todayReservations$.pipe(
    map(list => list.length),
    takeUntilDestroyed(this.destroyRef)
  );

  this.vm$ = combineLatest([
    this.tab$,
    this.pageNo$,
    this.reservations$,
    this.search$.pipe(debounceTime(300)),
    this.dateRange$,
    this.sort$
  ]).pipe(
    switchMap(([tab, pageNo, allReservations, search, dateRange, sort]) =>
      this.getVmForParams(tab, pageNo, allReservations, search, dateRange, sort)
    ),
    shareReplay({ bufferSize: 1, refCount: true }),
    takeUntilDestroyed(this.destroyRef)
  );
}


  private getVmForParams(
    tab: VenueTab,
    pageNo: number,
    allReservations: ReservationResponseDto[],
    search: string,
    dateRange: { from: string; to: string },
    sort: SortOption
  ): Observable<ViewModel> {
    
    let filtered = this.applyFilter(allReservations, tab);
    filtered = this.applySearch(filtered, search);
    filtered = this.applyDateRange(filtered, dateRange);
    filtered = this.applySort(filtered, sort);

    const start   = (pageNo - 1) * this.pageSize;
    const end     = start + this.pageSize;
    const slice   = filtered.slice(start, end);
    const hasMore = end < filtered.length;

    return of({
      items:       slice,
      loading:     false,
      loadingMore: false,
      hasMore,
      errorMsg:    '',
      pageNo,
    });
  }


  private applyFilter(
    list: ReservationResponseDto[],
    tab: VenueTab
  ): ReservationResponseDto[] {
    if (tab === 'ALL') return list;
    return list.filter(r => r.status === tab);
  }

  private applySearch(
    list: ReservationResponseDto[],
    search: string
  ): ReservationResponseDto[] {
    if (!search.trim()) return list;
    
    const query = search.toLowerCase();
    return list.filter(r => {
      const phone = r.phone?.toLowerCase() || '';
      const people = r.numberOfPeople?.toString() || '';
      const userId = r.userId?.toLowerCase() || '';
      const requests = r.specialRequests?.toLowerCase() || '';
      
      return phone.includes(query) || 
             people.includes(query) || 
             userId.includes(query) ||
             requests.includes(query);
    });
  }

  private applyDateRange(
    list: ReservationResponseDto[],
    dateRange: { from: string; to: string }
  ): ReservationResponseDto[] {
    if (!dateRange.from && !dateRange.to) return list;
    
    return list.filter(r => {
      if (!r.reservationDate) return false;
      
      const resDate = r.reservationDate;
      
      if (dateRange.from && resDate < dateRange.from) return false;
      if (dateRange.to && resDate > dateRange.to) return false;
      
      return true;
    });
  }

  private applySort(
    list: ReservationResponseDto[],
    sort: SortOption
  ): ReservationResponseDto[] {
    const sorted = [...list];
    
    switch (sort) {
      case 'date-desc':
        return sorted.sort((a, b) => (b.reservationDate || '').localeCompare(a.reservationDate || ''));
      case 'date-asc':
        return sorted.sort((a, b) => (a.reservationDate || '').localeCompare(b.reservationDate || ''));
      case 'time-asc':
        return sorted.sort((a, b) => (a.reservationTime || '').localeCompare(b.reservationTime || ''));
      case 'time-desc':
        return sorted.sort((a, b) => (b.reservationTime || '').localeCompare(a.reservationTime || ''));
      case 'people-desc':
        return sorted.sort((a, b) => (b.numberOfPeople || 0) - (a.numberOfPeople || 0));
      case 'people-asc':
        return sorted.sort((a, b) => (a.numberOfPeople || 0) - (b.numberOfPeople || 0));
      default:
        return sorted;
    }
  }

  private countTabs(list: ReservationResponseDto[]): VenueTabCounts {
    return {
      ALL:       list.length,
      PENDING:   list.filter(r => r.status === 'PENDING').length,
      ACCEPTED:  list.filter(r => r.status === 'ACCEPTED').length,
      REJECTED:  list.filter(r => r.status === 'REJECTED').length,
      CANCELLED: list.filter(r => r.status === 'CANCELLED').length,
    };
  }


  onSearchChange(): void {
    this.search$.next(this.searchQuery);
    this.pageNo$.next(1);
    this.clearCache();
  }

  onDateFilterChange(): void {
    this.dateRange$.next({ from: this.dateFrom, to: this.dateTo });
    this.pageNo$.next(1);
    this.clearCache();
  }

  onSortChange(): void {
    this.sort$.next(this.sortBy);
    this.pageNo$.next(1);
    this.clearCache();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.onSearchChange();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.sortBy = 'date-desc';
    this.search$.next('');
    this.dateRange$.next({ from: '', to: '' });
    this.sort$.next('date-desc');
    this.pageNo$.next(1);
    this.clearCache();
  }

  viewTodayReservations(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.dateFrom = today;
    this.dateTo = today;
    this.onDateFilterChange();
  }


  setTab(tab: VenueTab): void {
    this.activeTab  = tab;
    this.filterOpen = false;
    this.mobileTabOpen = false;  
    this.tab$.next(tab);
    this.pageNo$.next(1);
    this.clearCache();
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
          this.clearCacheAndReset();
        },
        error: err => {
          console.error('[VenuePanelComponent] Accept failed:', err);
        },
      });
  }

  rejectReservation(id: string): void {
    this.venue$.pipe(take(1)).subscribe(venue => {
      const ref = this.modalService.open(RejectReasonModalComponent, {
        data: {
          reservationId: id,
          venueName:     venue?.name,
        },
      });

      ref.instance.confirmed
        .pipe(take(1))
        .subscribe(() => {
          this.clearCacheAndReset();
        });
    });
  }

  viewDetails(id: string): void {
    this.reservationService.getReservationById(id)
      .pipe(take(1))
      .subscribe({
        next: reservation => {
          this.modalService.open(ReservationDetailsModalComponent, {
            data: reservation,
          });
        },
        error: err => {
          console.error('[VenuePanelComponent] Load details failed:', err);
        },
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
  };

  this.venueService.updateVenue(updateRequest, venue.id)
    .pipe(take(1))
    .subscribe({
      next: () => {
        this.isTogglingActive = false;
        this.toggleSuccessMsg = 'Status ažuriran';
        // Refresh venue stream
        this.venue$ = this.venueService.getMyVenue().pipe(
          tap(v => { this.venueId = v.id; }),
          shareReplay({ bufferSize: 1, refCount: true })
        );
        setTimeout(() => { this.toggleSuccessMsg = ''; }, 3000);
      },
      error: err => {
        this.isTogglingActive = false;
        this.toggleErrorMsg   = 'Greška pri ažuriranju';
        console.error('[VenuePanelComponent] Toggle active failed:', err);
        setTimeout(() => { this.toggleErrorMsg = ''; }, 3000);
      },
    });
}


  private clearCache(): void {
    this.pageCache.clear();
    this.hasMoreCache.clear();
  }

  private clearCacheAndReset(): void {
    this.clearCache();
    this.pageNo$.next(1);
    this.refresh$.next();
  }
}
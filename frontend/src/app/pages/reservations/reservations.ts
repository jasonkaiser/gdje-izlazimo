import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReservationCard } from '../../components/cards/reservation-card/reservation-card';
import { ReservationResponseDto } from '../../core/models/reservations/reservation-response.dto';
import { ReservationService } from '../../core/api/reservation-service';
import { AuthService } from '../../core/auth/auth.service';
import { ReservationStatus } from '../../core/models/reservations/reservation-status.enum';
import { ModalService } from '../../core/services/modal';
import { ReservationDetailsModalComponent } from '../../components/modals/reservation-details-modal/reservation-details-modal';
import { RejectReasonViewModalComponent } from '../../components/modals/reject-reason-view-modal/reject-reason-view-modal';

type Tab = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED';

type TabCounts = {
  ALL: number;
  UPCOMING: number;
  PAST: number;
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

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReservationCard],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  private readonly modalService = inject(ModalService);
  private readonly reservationService = inject(ReservationService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tabs: Tab[] = ['ALL', 'UPCOMING', 'PAST', 'CANCELLED'];
  private tab$ = new BehaviorSubject<Tab>('ALL');
  private pageNo$ = new BehaviorSubject<number>(1);
  
  activeTab: Tab = 'ALL';
  private readonly pageSize = 8;

  reservations$: Observable<ReservationResponseDto[]> = of([]);
  counts$: Observable<TabCounts> = of({ ALL: 0, UPCOMING: 0, PAST: 0, CANCELLED: 0 });
  vm$: Observable<ViewModel> = of({
    items: [],
    loading: false,
    loadingMore: false,
    hasMore: false,
    errorMsg: '',
    pageNo: 1,
  });

  loading = false;
  error?: string;
  filterOpen = false;

  private pageCache = new Map<string, ReservationResponseDto[]>();
  private hasMoreCache = new Map<string, boolean>();

  constructor() {}

  ngOnInit() {
    this.initializeStreams();
  }

  private initializeStreams() {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.error = 'User not authenticated';
      return;
    }

    this.reservations$ = this.reservationService
      .getReservationsByUser(userId, { pageSize: 1000, sortBy: 'reservationDate', sortDir: 'ASC' })
      .pipe(
        catchError((err) => {
          console.error(err);
          this.error = 'Failed to load reservations.';
          return of([]);
        }),
        shareReplay(1)
      );

    this.counts$ = this.reservations$.pipe(
      map((list) => this.countTabs(list))
    );

    this.vm$ = combineLatest([this.tab$, this.pageNo$, this.reservations$]).pipe(
      tap(([tab]) => {
        if (this.activeTab !== tab) {
          this.pageCache.clear();
          this.hasMoreCache.clear();
          this.pageNo$.next(1);
        }
        this.activeTab = tab;
      }),
      switchMap(([tab, pageNo, allReservations]) => 
        this.getVmForParams(tab, pageNo, allReservations)
      ),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private getVmForParams(
    tab: Tab,
    pageNo: number,
    allReservations: ReservationResponseDto[]
  ): Observable<ViewModel> {
    const cacheKey = `${tab}-${pageNo}`;
    const cached = this.pageCache.get(cacheKey);

    if (cached) {
      return of(this.buildVm(tab, pageNo));
    }

    const initialVm: ViewModel = {
      items: [],
      loading: pageNo === 1,
      loadingMore: pageNo > 1,
      hasMore: this.hasMoreCache.get(`${tab}-${pageNo - 1}`) ?? true,
      errorMsg: '',
      pageNo,
    };

    // Filter and paginate
    const filtered = this.applyFilter(allReservations, tab);
    const sorted = filtered
      .slice()
      .sort((a, b) => this.toDateTime(a).getTime() - this.toDateTime(b).getTime());

    const startIdx = (pageNo - 1) * this.pageSize;
    const endIdx = startIdx + this.pageSize;
    const paginated = sorted.slice(startIdx, endIdx);
    const hasMore = endIdx < sorted.length;

    this.pageCache.set(cacheKey, paginated);
    this.hasMoreCache.set(cacheKey, hasMore);

    const finalVm = this.buildVm(tab, pageNo);

    // Emit loading state first, then final VM
    return of(initialVm, finalVm);
  }

  private buildVm(tab: Tab, pageNo: number): ViewModel {
    const cacheKey = `${tab}-${pageNo}`;
    return {
      items: this.pageCache.get(cacheKey) ?? [],
      loading: false,
      loadingMore: false,
      hasMore: this.hasMoreCache.get(cacheKey) ?? false,
      errorMsg: '',
      pageNo,
    };
  }

  viewReservationDetails(id: string) {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.reservationService.getReservationById(id).subscribe({
      next: (reservation) => {
        this.modalService.open(ReservationDetailsModalComponent, {
          data: reservation
        });
      },
      error: (err) => {
        console.error('Failed to load reservation details:', err);
        this.error = 'Failed to load reservation details.';
      },
    });
  }

  viewRejectReason(id: string): void {
    this.reservationService.getReservationById(id)
      .pipe(take(1))
      .subscribe({
        next: reservation => {
          this.modalService.open(RejectReasonViewModalComponent, {
            data: {
              rejectReason: reservation.rejectReason || '',
              venueName: reservation.venueName,
              reservationDate: reservation.reservationDate,
              reservationTime: reservation.reservationTime
            }
          });
        },
        error: err => {
          console.error('Failed to load reservation:', err);
          this.error = 'Greška pri učitavanju razloga odbijanja.';
        }
      });
  }

  cancelReservation(id: string) {
    if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) {
      return;
    }

    this.reservationService.cancelReservation(id).subscribe({
      next: () => {
        // Clear cache and reload
        this.pageCache.clear();
        this.hasMoreCache.clear();
        this.pageNo$.next(1);
        this.initializeStreams();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Failed to cancel reservation.';
      },
    });
  }

  setTab(tab: Tab) {
    this.activeTab = tab;
    this.tab$.next(tab);
    this.pageNo$.next(1);
    this.filterOpen = false;
  }

  toggleFilter() {
    this.filterOpen = !this.filterOpen;
  }

  nextPage(): void {
    const currentPage = this.pageNo$.value;
    this.pageNo$.next(currentPage + 1);
  }

  prevPage(): void {
    const currentPage = this.pageNo$.value;
    const next = Math.max(1, currentPage - 1);
    this.pageNo$.next(next);
  }

  private toDateTime(r: ReservationResponseDto): Date {
    const time = (r.reservationTime ?? '00:00').slice(0, 5);
    return new Date(`${r.reservationDate}T${time}:00`);
  }

  private applyFilter(list: ReservationResponseDto[], tab: Tab) {
    const now = new Date();

    if (tab === 'ALL') return list;

    if (tab === 'CANCELLED') {
      return list.filter((r) => r.status === ReservationStatus.CANCELLED);
    }

    if (tab === 'PAST') {
      return list.filter(
        (r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) < now
      );
    }

    // UPCOMING
    return list.filter(
      (r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) >= now
    );
  }

  private countTabs(list: ReservationResponseDto[]): TabCounts {
    const now = new Date();

    const cancelled = list.filter((r) => r.status === ReservationStatus.CANCELLED).length;

    const past = list.filter(
      (r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) < now
    ).length;

    const upcoming = list.filter(
      (r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) >= now
    ).length;

    return {
      ALL: list.length,
      UPCOMING: upcoming,
      PAST: past,
      CANCELLED: cancelled,
    };
  }

  tabLabel(tab: Tab) {
    if (tab === 'ALL') return 'Sve';
    if (tab === 'UPCOMING') return 'Nadolazeće';
    if (tab === 'PAST') return 'Prošle';
    return 'Otkazane';
  }
}
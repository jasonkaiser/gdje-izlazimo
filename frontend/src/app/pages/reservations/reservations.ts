import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, startWith, switchMap, take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReservationCard } from '../../components/cards/reservation-card/reservation-card';
import { RatingModal } from '../../components/modals/rating-modal/rating-modal';
import { ReservationResponseDto } from '../../core/models/reservations/reservation-response.dto';
import { ReservationService } from '../../core/api/reservation-service';
import { AuthService } from '../../core/auth/auth.service';
import { RatingService } from '../../core/api/rating-service';
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
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
};

@Component({
  selector: 'app-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, ReservationCard, RatingModal],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  private readonly modalService       = inject(ModalService);
  private readonly reservationService = inject(ReservationService);
  private readonly ratingService      = inject(RatingService);
  private readonly authService        = inject(AuthService);
  private readonly destroyRef         = inject(DestroyRef);
  private readonly cdr                = inject(ChangeDetectorRef);

  readonly tabs: Tab[] = ['ALL', 'UPCOMING', 'PAST', 'CANCELLED'];
  activeTab: Tab = 'ALL';
  filterOpen     = false;

  ratingModalShown          = false;
  isSubmittingRating        = false;
  selectedReservation: ReservationResponseDto | null = null;
  ratedReservationIds       = signal<Set<string>>(new Set());

  private readonly pageSize = 8;
  private readonly tab$     = new BehaviorSubject<Tab>('ALL');
  private readonly pageNo$  = new BehaviorSubject<number>(1);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);
  private readonly ratedIds$ = new BehaviorSubject<Set<string>>(new Set());

  counts$!: Observable<TabCounts>;
  vm$!:     Observable<ViewModel>;

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    const reservations$ = this.refresh$.pipe(
      switchMap(() =>
        this.reservationService
          .getReservationsByUser(userId!, { pageSize: 1000, sortBy: 'reservationDate', sortDir: 'ASC' })
          .pipe(catchError(() => of([] as ReservationResponseDto[])))
      ),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    reservations$.pipe(
      take(1),
      switchMap((list) => {
        const rateable = list.filter((r) => {
          return r.status === ReservationStatus.ACCEPTED &&
                new Date(r.reservationDate) < new Date();
        });

        if (rateable.length === 0) return of(new Set<string>());

        return combineLatest(
          rateable.map((r) =>
            this.ratingService.hasRated(r.id, r.userId).pipe(
              map((rated) => ({ id: r.id, rated })),
              catchError(() => of({ id: r.id, rated: false }))
            )
          )
        ).pipe(
          map((results) => new Set(
            results.filter((x) => x.rated).map((x) => x.id)
          ))
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((ids) => {
      this.ratedReservationIds.set(ids);
      this.cdr.markForCheck();
    });

    const loadingVm: ViewModel = {
      items: [], loading: true, hasMore: false, errorMsg: '', pageNo: 1,
    };

    this.vm$ = combineLatest([this.tab$, this.pageNo$, reservations$]).pipe(
      map(([tab, pageNo, all]) => this.buildVm(tab, pageNo, all)),
      startWith(loadingVm),
      takeUntilDestroyed(this.destroyRef),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  private buildVm(tab: Tab, pageNo: number, all: ReservationResponseDto[]): ViewModel {
    const filtered = this.applyFilter(all, tab).slice().sort(
      (a, b) => this.toDateTime(a).getTime() - this.toDateTime(b).getTime()
    );

    const start = (pageNo - 1) * this.pageSize;
    const end   = start + this.pageSize;

    return {
      items:    filtered.slice(start, end),
      loading:  false,
      hasMore:  end < filtered.length,
      errorMsg: '',
      pageNo,
    };
  }

  openRatingModal(reservation: ReservationResponseDto): void {
    this.selectedReservation = reservation;
    this.ratingModalShown    = true;
    this.cdr.markForCheck();
  }

  submitRating(payload: { rating: number; comment: string }): void {
    const r      = this.selectedReservation;
    const userId = this.authService.getUserId();
    if (!r || !userId) return;

    this.isSubmittingRating = true;
    this.cdr.markForCheck();

    this.ratingService.createRating({
      venueId:       r.venueId,
      userId,
      rating:        payload.rating,
      comment:       payload.comment || undefined,
    }).pipe(take(1)).subscribe({
      next: () => {
        this.ratedReservationIds.update(ids => new Set([...ids, r.id]));
        this.ratingModalShown    = false;
        this.isSubmittingRating  = false;
        this.selectedReservation = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isSubmittingRating = false;
        this.cdr.markForCheck();
      },
    });
  }

  closeRatingModal(): void {
    this.ratingModalShown    = false;
    this.selectedReservation = null;
    this.cdr.markForCheck();
  }

  cancelReservation(id: string): void {
    if (!confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) return;

    this.reservationService.cancelReservation(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.pageNo$.next(1);
          this.refresh$.next();
        },
      });
  }

  viewReservationDetails(id: string): void {
    this.reservationService.getReservationById(id)
      .pipe(take(1))
      .subscribe({
        next: (reservation) => this.modalService.open(ReservationDetailsModalComponent, { data: reservation }),
      });
  }

  viewRejectReason(id: string): void {
    this.reservationService.getReservationById(id)
      .pipe(take(1))
      .subscribe({
        next: (reservation) => {
          this.modalService.open(RejectReasonViewModalComponent, {
            data: {
              rejectReason:    reservation.rejectReason || '',
              venueName:       reservation.venueName,
              reservationDate: reservation.reservationDate,
              reservationTime: reservation.reservationTime,
            },
          });
        },
      });
  }

  isRated(id: string): boolean {
    return this.ratedReservationIds().has(id);
  }

  setTab(tab: Tab): void {
    this.activeTab  = tab;
    this.filterOpen = false;
    this.tab$.next(tab);
    this.pageNo$.next(1);
  }

  toggleFilter(): void {
    this.filterOpen = !this.filterOpen;
  }

  nextPage(): void { this.pageNo$.next(this.pageNo$.value + 1); }
  prevPage(): void { this.pageNo$.next(Math.max(1, this.pageNo$.value - 1)); }

  tabLabel(tab: Tab): string {
    const labels: Record<Tab, string> = {
      ALL: 'Sve', UPCOMING: 'Nadolazeće', PAST: 'Prošle', CANCELLED: 'Otkazane',
    };
    return labels[tab];
  }

  private applyFilter(list: ReservationResponseDto[], tab: Tab): ReservationResponseDto[] {
    const now = new Date();
    if (tab === 'ALL')       return list;
    if (tab === 'CANCELLED') return list.filter((r) => r.status === ReservationStatus.CANCELLED);
    if (tab === 'PAST')      return list.filter((r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) < now);
    return list.filter((r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) >= now);
  }

  private countTabs(list: ReservationResponseDto[]): TabCounts {
    const now = new Date();
    return {
      ALL:       list.length,
      CANCELLED: list.filter((r) => r.status === ReservationStatus.CANCELLED).length,
      PAST:      list.filter((r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) < now).length,
      UPCOMING:  list.filter((r) => r.status !== ReservationStatus.CANCELLED && this.toDateTime(r) >= now).length,
    };
  }

  private toDateTime(r: ReservationResponseDto): Date {
    return new Date(`${r.reservationDate}T${(r.reservationTime ?? '00:00').slice(0, 5)}:00`);
  }
}
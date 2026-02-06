import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, finalize } from 'rxjs/operators';

import { ReservationCard } from '../../components/cards/reservation-card/reservation-card';
import { ReservationResponseDto } from '../../core/models/reservations/reservation-response.dto';
import { ReservationService } from '../../core/api/reservation-service';
import { AuthService } from '../../core/auth/auth.service';
import { ReservationStatus } from '../../core/models/reservations/reservation-status.enum';

type Tab = 'ALL' | 'UPCOMING' | 'PAST' | 'CANCELLED';


type TabCounts = {
  ALL: number;
  UPCOMING: number;
  PAST: number;
  CANCELLED: number;
};

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, ReservationCard],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {

  readonly tabs: Tab[] = ['ALL', 'UPCOMING', 'PAST', 'CANCELLED'];
  private tab$ = new BehaviorSubject<Tab>('ALL');
  activeTab: Tab = 'ALL';

  reservations$: Observable<ReservationResponseDto[]> = of([]);
  filtered$: Observable<ReservationResponseDto[]> = of([]);
  counts$: Observable<TabCounts> = of({ ALL: 0, UPCOMING: 0, PAST: 0, CANCELLED: 0 });


  loading = false;
  error?: string;
  filterOpen = false

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadReservations();
  }

  

  viewReservationDetails(id: string) {
    // odraditi kasnije ili modul ili poseban page
  }

  cancelReservation(id: string) {
    this.reservationService.cancelReservation(id).subscribe({
      next: () => this.loadReservations(),
      error: (err) => console.error(err),
    });
  }

   setTab(tab: Tab) {
    this.activeTab = tab;
    this.tab$.next(tab);
    this.filterOpen = false; 
  }

  toggleFilter() {
    this.filterOpen = !this.filterOpen;
  }

  loadReservations() {
    const userId = this.authService.getUserId();

    if (!userId) {
      this.error = 'User not authenticated';
      this.reservations$ = of([]);
      this.filtered$ = of([]);
      this.counts$ = of({ ALL: 0, UPCOMING: 0, PAST: 0, CANCELLED: 0 });
      return;
    }

    this.loading = true;
    this.error = undefined;

    this.reservations$ = this.reservationService
      .getReservationsByUser(userId, { pageSize: 100, sortBy: 'reservationDate', sortDir: 'ASC' })
      .pipe(
        catchError((err) => {
          console.error(err);
          this.error = 'Failed to load reservations.';
          return of([]);
        }),
        finalize(() => (this.loading = false)),
        shareReplay(1)
      );

    this.counts$ = this.reservations$.pipe(
      map((list) => this.countTabs(list))
    );

    this.filtered$ = combineLatest([this.reservations$, this.tab$]).pipe(
      map(([list, tab]) => this.applyFilter(list, tab)),
      map((list) =>
        list
          .slice()
          .sort((a, b) => this.toDateTime(a).getTime() - this.toDateTime(b).getTime())
      )
    );
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
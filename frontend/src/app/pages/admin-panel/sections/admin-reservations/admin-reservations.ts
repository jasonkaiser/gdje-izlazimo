import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  DestroyRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  switchMap,
  map,
  catchError,
  shareReplay,
  debounceTime,
  take
} from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReservationResponseDto } from '../../../../core/models/reservations/reservation-response.dto';
import { ReservationStatus } from '../../../../core/models/reservations/reservation-status.enum';
import { ReservationService } from '../../../../core/api/reservation-service';
import { ModalService } from '../../../../core/services/modal';
import { ReservationDetailsModalComponent } from '../../../../components/modals/reservation-details-modal/reservation-details-modal';
import { ToastService } from '../../../../core/ui/toast';
import { ConfirmModalComponent } from '../../../../components/modals/confirm-modal/confirm-modal';
import { AppDropdown } from '../../../../components/other/dropdown/dropdown';

type StatusFilter = 'ALL' | ReservationStatus;

interface ReservationStats {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
}

interface ViewModel {
  items: ReservationResponseDto[];
  loading: boolean;
  hasMore: boolean;
  errorMsg: string;
  pageNo: number;
}

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, AppDropdown],
  templateUrl: './admin-reservations.html',
  styleUrl: './admin-reservations.css'
})
export class AdminReservationsComponent implements OnInit {
  
  private readonly reservationService = inject(ReservationService);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  searchQuery = '';
  statusFilter: StatusFilter = 'ALL';
  dateFrom = '';
  dateTo = '';
  readonly pageSize = 10;

  // Premium dropdown options for status filter
  readonly statusFilterOptions = [
    { value: 'ALL' as const, label: 'Svi statusi' },
    { value: ReservationStatus.PENDING, label: 'Na čekanju' },
    { value: ReservationStatus.ACCEPTED, label: 'Prihvaćene' },
    { value: ReservationStatus.REJECTED, label: 'Odbijene' },
    { value: ReservationStatus.CANCELLED, label: 'Otkazane' }
  ];

  private readonly search$ = new BehaviorSubject<string>('');
  private readonly statusFilter$ = new BehaviorSubject<StatusFilter>('ALL');
  private readonly dateRange$ = new BehaviorSubject<{ from: string; to: string }>({ from: '', to: '' });
  private readonly pageNo$ = new BehaviorSubject<number>(1);
  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  reservations$!: Observable<ReservationResponseDto[]>;
  stats$!: Observable<ReservationStats>;
  vm$!: Observable<ViewModel>;

  ngOnInit(): void {
    this.initializeStreams();
  }

  private initializeStreams(): void {
    
    this.reservations$ = this.refresh$.pipe(
      switchMap(() =>
        this.reservationService.getAllReservations({ 
          pageSize: 1000, 
          sortBy: 'id', 
          sortDir: 'DESC' 
        }).pipe(
          catchError(err => {
            this.toastService.show('Greška pri učitavanju rezervacija', 'error');
            return of([] as ReservationResponseDto[]);
          })
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.stats$ = this.reservations$.pipe(
      map(reservations => ({
        total: reservations.length,
        pending: reservations.filter(r => r.status === ReservationStatus.PENDING).length,
        accepted: reservations.filter(r => r.status === ReservationStatus.ACCEPTED).length,
        rejected: reservations.filter(r => r.status === ReservationStatus.REJECTED).length,
        cancelled: reservations.filter(r => r.status === ReservationStatus.CANCELLED).length
      })),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );

    this.vm$ = this.reservations$.pipe(
      switchMap(allReservations => 
        this.search$.pipe(
          debounceTime(300),
          switchMap(search =>
            this.statusFilter$.pipe(
              switchMap(statusFilter =>
                this.dateRange$.pipe(
                  switchMap(dateRange =>
                    this.pageNo$.pipe(
                      map(pageNo => {
                        let filtered = this.applySearch(allReservations, search);
                        filtered = this.applyStatusFilter(filtered, statusFilter);
                        filtered = this.applyDateRange(filtered, dateRange);

                        const start = (pageNo - 1) * this.pageSize;
                        const end = start + this.pageSize;
                        const slice = filtered.slice(start, end);
                        const hasMore = end < filtered.length;

                        return {
                          items: slice,
                          loading: false,
                          hasMore,
                          errorMsg: '',
                          pageNo
                        };
                      })
                    )
                  )
                )
              )
            )
          )
        )
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private applySearch(reservations: ReservationResponseDto[], search: string): ReservationResponseDto[] {
    if (!search.trim()) return reservations;
    
    const query = search.toLowerCase();
    return reservations.filter(r =>
      r.venueName.toLowerCase().includes(query) ||
      r.venueAddress.toLowerCase().includes(query) ||
      r.phone.toLowerCase().includes(query) ||
      r.userId.toLowerCase().includes(query)
    );
  }

  private applyStatusFilter(reservations: ReservationResponseDto[], filter: StatusFilter): ReservationResponseDto[] {
    if (filter === 'ALL') return reservations;
    return reservations.filter(r => r.status === filter);
  }

  private applyDateRange(
    reservations: ReservationResponseDto[],
    dateRange: { from: string; to: string }
  ): ReservationResponseDto[] {
    if (!dateRange.from && !dateRange.to) return reservations;
    
    return reservations.filter(r => {
      if (!r.reservationDate) return false;
      
      const resDate = r.reservationDate;
      
      if (dateRange.from && resDate < dateRange.from) return false;
      if (dateRange.to && resDate > dateRange.to) return false;
      
      return true;
    });
  }

  onSearchChange(): void {
    this.search$.next(this.searchQuery);
    this.pageNo$.next(1);
  }

  onFilterChange(): void {
    this.statusFilter$.next(this.statusFilter);
    this.pageNo$.next(1);
  }

  onDateFilterChange(): void {
    this.dateRange$.next({ from: this.dateFrom, to: this.dateTo });
    this.pageNo$.next(1);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = 'ALL';
    this.dateFrom = '';
    this.dateTo = '';
    this.search$.next('');
    this.statusFilter$.next('ALL');
    this.dateRange$.next({ from: '', to: '' });
    this.pageNo$.next(1);
  }

  nextPage(): void {
    this.pageNo$.next(this.pageNo$.getValue() + 1);
  }

  prevPage(): void {
    const current = this.pageNo$.getValue();
    if (current > 1) this.pageNo$.next(current - 1);
  }

  getStatusLabel(status: ReservationStatus): string {
    const labels: Record<ReservationStatus, string> = {
      [ReservationStatus.PENDING]: 'Na Čekanju',
      [ReservationStatus.ACCEPTED]: 'Prihvaćena',
      [ReservationStatus.REJECTED]: 'Odbijena',
      [ReservationStatus.CANCELLED]: 'Otkazana'
    };
    return labels[status];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('bs-BA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  viewReservation(reservation: ReservationResponseDto): void {
    this.modalService.open(ReservationDetailsModalComponent, {
      data: reservation
    });
  }

  cancelReservation(reservation: ReservationResponseDto): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      data: {
        title: 'Otkaži Rezervaciju',
        message: `Da li ste sigurni da želite otkazati rezervaciju za "${reservation.venueName}"?`,
        confirmText: 'Otkaži Rezervaciju',
        cancelText: 'Nazad',
        variant: 'warning'
      }
    });

    (modalRef.instance as ConfirmModalComponent).confirmed
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.reservationService.cancelReservation(reservation.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.refresh$.next();
                this.toastService.show('Rezervacija uspješno otkazana', 'success');
              },
              error: err => {
                this.toastService.show('Greška pri otkazivanju rezervacije', 'error');
              }
            });
        }
      });
  }

  deleteReservation(reservation: ReservationResponseDto): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      data: {
        title: 'Obriši Rezervaciju',
        message: `Da li ste sigurni da želite obrisati ovu rezervaciju?\n\nLokal: ${reservation.venueName}\nDatum: ${this.formatDate(reservation.reservationDate)}\n\nOva akcija se ne može poništiti.`,
        confirmText: 'Obriši',
        cancelText: 'Otkaži',
        variant: 'danger'
      }
    });

    (modalRef.instance as ConfirmModalComponent).confirmed
      .pipe(take(1))
      .subscribe(confirmed => {
        if (confirmed) {
          this.reservationService.deleteReservation(reservation.id)
            .pipe(take(1))
            .subscribe({
              next: () => {
                this.refresh$.next();
                this.toastService.show('Rezervacija uspješno obrisana', 'success');
              },
              error: err => {
                this.toastService.show('Greška pri brisanju rezervacije', 'error');
              }
            });
        }
      });
  }
}